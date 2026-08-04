import requests

url = "http://localhost:8000/api/v1/login/access-token"
data = {
    "username": "abc@gmail.com",
    "password": "1234"
}

print("Testing login POST for abc@gmail.com with password '1234'...")
response = requests.post(url, data=data)
print("Status Code:", response.status_code)
print("Response JSON:", response.text)
