from backend.app.auth.security import hash_password
from backend.app.auth.security import verify_password


password = "Admin@12345"


hashed_password = hash_password(password)


print("Original password:")
print(password)

print()

print("Hashed password:")
print(hashed_password)

print()

print("Password verification:")

print(
    verify_password(
        password,
        hashed_password
    )
)