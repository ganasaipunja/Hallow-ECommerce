import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings # Settings import cheyali
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

# Unified Imports
from .models import User, Product, Cart, Order, OrderItem, Banner
from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    OTPSendSerializer,
    OTPVerifySerializer,
    ProductSerializer,
    CartSerializer,
    CartAddSerializer,
    OrderSerializer,
    BannerSerializer,
)

# --- HELPERS ---
def _generate_otp():
    """Generates a 6-digit numeric OTP."""
    return ''.join(random.choices(string.digits, k=6))

# --- HOME PAGE --- 
@api_view(['GET'])
@permission_classes([AllowAny])
def home_view(request):
    """Fetches Banners and Trending Products for the Home Page."""
    banners = Banner.objects.all().order_by('slot_index')[:6]
    banner_ser = BannerSerializer(banners, many=True, context={'request': request})
    
    products = Product.objects.all().order_by('-created_at')[:4]
    product_ser = ProductSerializer(products, many=True, context={'request': request})
    
    return Response({
        "message": "Welcome to Hallow Ecommerce API",
        "banners": banner_ser.data,
        "featured_products": product_ser.data
    })

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Finalizes registration after Email OTP verification."""
    email = request.data.get('email')
    otp_received = request.data.get('otp')
    password = request.data.get('password')
    username = request.data.get('username')

    if not email or not otp_received:
        return Response({'error': 'Email and OTP are required'}, status=400)

    try:
        user = User.objects.get(email=email)
        
        # User already registered check
        if user.is_active and user.has_usable_password(): # Password check update
             return Response({'error': 'User already registered. Please login.'}, status=400)

        # Validate OTP
        expiry = user.otp_created_at + timedelta(minutes=10) if user.otp_created_at else None
        if user.otp != otp_received:
            return Response({'error': 'Invalid Email OTP'}, status=400)
        if expiry and timezone.now() > expiry:
            return Response({'error': 'OTP expired. Please request a new one.'}, status=400)
            
        if username:
            user.username = username
        
        if password:
            user.set_password(password)
        else:
            return Response({'error': 'Password is required'}, status=400)
        
        user.is_active = True 
        user.otp = None 
        user.save()
        
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'message': 'Registration successful!'
        }, status=201)

    except User.DoesNotExist:
        return Response({'error': 'No registration request found for this email.'}, status=400)
    except Exception as e:
        return Response({'error': f'Something went wrong: {str(e)}'}, status=500)
        
@api_view(['POST'])
@permission_classes([AllowAny])
def otp_send(request):
    """Handles sending OTP to either Email or Phone."""
    email = request.data.get('email')
    phone = request.data.get('phone')
    otp = _generate_otp()
    now = timezone.now()

    if email:
        # returns active=False initially to distinguish from fully registered users
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'is_active': False 
            }
        )
        user.otp = otp
        user.otp_created_at = now
        user.save()

        # OTP Send Fix: fail_silently=True pettanu
        try:
            send_mail(
                'Your HALLOW Verification Code',
                f'Your code is: {otp}',
                settings.EMAIL_HOST_USER, # noreply badulu sender user ni vadali
                [email],
                fail_silently=False, 
            )
        except Exception as e:
            print(f"Email Error: {str(e)}")

        return Response({'message': 'OTP generated. Check email or database.'})

    elif phone:
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                'username': f'user_{phone}',
                'is_active': False
            }
        )
        user.otp = otp
        user.otp_created_at = now
        user.save()
        print(f'--- DEBUG OTP for {phone}: {otp} ---')
        return Response({'message': 'OTP sent to phone'})

    return Response({'error': 'Email or Phone required'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Standard Login with 2FA/OTP logic."""
    ser = UserLoginSerializer(data=request.data)
    
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        
    user = ser.validated_data['user']
    otp_received = request.data.get('otp')

    if not otp_received:
        if not user.email:
            return Response({'error': 'No email linked to this account.'}, status=400)
            
        otp = _generate_otp()
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()

        try:
            send_mail(
                'Your Login Verification Code',
                f'Your code is: {otp}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Mail Error: {e}")

        return Response({
            'step': '2FA_REQUIRED',
            'message': 'OTP sent to your email.'
        }, status=200)

    # STEP 2: Verify OTP
    expiry = user.otp_created_at + timedelta(minutes=10) if user.otp_created_at else None
    
    if user.otp != otp_received:
        return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)
        
    if expiry and timezone.now() > expiry:
        return Response({'error': '2FA code expired'}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    user.otp = None 
    user.save()

    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
    })

# Legacy verify
@api_view(['POST'])
@permission_classes([AllowAny])
def otp_verify(request):
    ser = OTPVerifySerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    phone = ser.validated_data['phone']
    otp = ser.validated_data['otp']
    
    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        return Response({'error': 'Invalid phone'}, status=status.HTTP_400_BAD_REQUEST)
    
    if user.otp != otp:
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
    expiry = user.otp_created_at + timedelta(minutes=10) if user.otp_created_at else None
    if expiry and timezone.now() > expiry:
        return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
    
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
    })

# --- PRODUCTS & CART ---
class ProductList(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

class CartView(generics.ListAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_add(request):
    ser = CartAddSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    product = ser.validated_data['product_id']
    quantity = ser.validated_data['quantity']
    
    cart, created = Cart.objects.get_or_create(
        user=request.user,
        product=product,
        defaults={'quantity': quantity}
    )
    if not created:
        cart.quantity += quantity
        cart.save(update_fields=['quantity'])
    
    return Response(CartSerializer(cart, context={'request': request}).data, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    try:
        item = Cart.objects.get(id=item_id, user=request.user)
        new_qty = request.data.get('quantity')
        if new_qty and int(new_qty) > 0:
            item.quantity = int(new_qty)
            item.save()
            return Response({'message': 'Updated'})
        return Response({'error': 'Invalid quantity'}, status=400)
    except Cart.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cart_remove(request, item_id):
    Cart.objects.filter(user=request.user, id=item_id).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# --- ORDERS ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_summary(request):
    cart_items = Cart.objects.filter(user=request.user).select_related('product')
    if not cart_items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    order = Order.objects.create(
        user=request.user, 
        total_amount=total, 
        status='pending',
        street=request.data.get('street'),
        city=request.data.get('city'),
        pincode=request.data.get('pincode'),
        payment_method=request.data.get('paymentMethod', 'cod')
    )

    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price
        )
    
    cart_items.delete()
    return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)

class OrderList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-id').prefetch_related('items')

