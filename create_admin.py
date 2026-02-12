from accounts.models import User

# Create admin user
user = User.objects.create_user(
    username='mouryarakesh512@gmail.com',
    email='mouryarakesh512@gmail.com',
    password='Rakesh@123!@',
    first_name='Rakesh',
    role='admin'
)
print('Admin user created successfully:', user.username)
