import httpx
import time
import sys

BASE_URL = "http://127.0.0.1:8000"
EMAIL = f"test_integration_{int(time.time())}@example.com"
PASSWORD = "testpassword123"
FULL_NAME = "Integration Test User"

def run_tests():
    print(f"Starting integration tests against {BASE_URL}...")
    
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Health Check
        print("\n1. Testing Health Check...")
        try:
            response = client.get("/")
            if response.status_code == 200:
                print("✅ Health check passed")
            else:
                print(f"❌ Health check failed: {response.status_code} {response.text}")
                sys.exit(1)
        except Exception as e:
            print(f"❌ Could not connect to backend: {e}")
            sys.exit(1)

        # 2. Register
        print(f"\n2. Testing Registration ({EMAIL})...")
        response = client.post("/users/", json={
            "email": EMAIL,
            "password": PASSWORD,
            "full_name": FULL_NAME
        })
        if response.status_code in [200, 201]:
             print("✅ Registration passed")
             user_id = response.json().get("id")
        else:
            print(f"❌ Registration failed: {response.status_code} {response.text}")
            sys.exit(1)

        # 3. Login
        print("\n3. Testing Login...")
        response = client.post("/token", data={
            "username": EMAIL,
            "password": PASSWORD
        })
        if response.status_code == 200:
            print("✅ Login passed")
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
        else:
            print(f"❌ Login failed: {response.status_code} {response.text}")
            sys.exit(1)

        # 4. Create Task
        print("\n4. Testing Create Task...")
        task_data = {
            "title": "Integration Test Task",
            "description": "Created by automated script",
            "priority": "high",
            "status": "todo"
        }
        response = client.post("/tasks/", json=task_data, headers=headers)
        if response.status_code in [200, 201]:
            print("✅ Create Task passed")
            task_id = response.json()["id"]
        else:
            print(f"❌ Create Task failed: {response.status_code} {response.text}")
            sys.exit(1)

        # 5. List Tasks
        print("\n5. Testing List Tasks...")
        response = client.get("/tasks/", headers=headers)
        if response.status_code == 200:
            tasks = response.json()
            if any(t["id"] == task_id for t in tasks):
                print("✅ List Tasks passed (task found)")
            else:
                print("❌ List Tasks failed (task not found)")
                sys.exit(1)
        else:
            print(f"❌ List Tasks failed: {response.status_code} {response.text}")
            sys.exit(1)

        # 6. Update Task
        print("\n6. Testing Update Task...")
        update_data = {"status": "in_progress"}
        response = client.put(f"/tasks/{task_id}", json=update_data, headers=headers)
        if response.status_code == 200 and response.json()["status"] == "in_progress":
            print("✅ Update Task passed")
        else:
            print(f"❌ Update Task failed: {response.status_code} {response.text}")
            sys.exit(1)

        # 7. Delete Task
        print("\n7. Testing Delete Task...")
        response = client.delete(f"/tasks/{task_id}", headers=headers)
        if response.status_code in [200, 204]:
            print("✅ Delete Task passed")
        else:
            print(f"❌ Delete Task failed: {response.status_code} {response.text}")
            sys.exit(1)

    print("\n🎉 All integration tests passed successfully!")

if __name__ == "__main__":
    try:
        run_tests()
    except KeyboardInterrupt:
        print("\nTests interrupted.")
        sys.exit(1)
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        sys.exit(1)
