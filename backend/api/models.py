from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'users'


class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default="General") # <-- ADD THIS
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'products'


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart'
        unique_together = ['user', 'product']


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    street = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    payment_method = models.CharField(max_length=20, default='cod')
    class Meta:
        db_table = 'orders'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'


class Banner(models.Model):
    slot_index = models.IntegerField(unique=True, help_text="Sequence 0-5")
    title = models.CharField(max_length=200, blank=True, null=True)
    image = models.ImageField(upload_to='banners/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'banners'
        ordering = ['slot_index']

    def __str__(self):
        return f"Slot {self.slot_index}: {self.title or 'No Title'}"