import pytest
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:55799"

class TestSubscriptionAPI:
    def setup_method(self):
        self.test_subscription = {
            "name": "Test Subscription",
            "price": 9.99,
            "renewal_date": datetime.now().isoformat(),
            "duration": "monthly",
            "type": "personal",
            "category": "streaming",
            "is_shared": False,
            "shared_with": []
        }
        self.subscription_id = None

    def test_01_create_subscription(self):
        response = requests.post(f"{BASE_URL}/subscriptions/", json=self.test_subscription)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == self.test_subscription["name"]
        assert float(data["price"]) == self.test_subscription["price"]
        self.subscription_id = data["_id"]

    def test_02_get_subscriptions(self):
        response = requests.get(f"{BASE_URL}/subscriptions/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_03_update_subscription(self):
        if not self.subscription_id:
            pytest.skip("No subscription ID available")
        
        updated_data = self.test_subscription.copy()
        updated_data["name"] = "Updated Test Subscription"
        updated_data["price"] = 19.99
        
        response = requests.put(f"{BASE_URL}/subscriptions/{self.subscription_id}", json=updated_data)
        assert response.status_code == 200
        
        # Verify the update
        response = requests.get(f"{BASE_URL}/subscriptions/")
        data = response.json()
        updated_sub = next((sub for sub in data if sub["_id"] == self.subscription_id), None)
        assert updated_sub is not None
        assert updated_sub["name"] == "Updated Test Subscription"
        assert float(updated_sub["price"]) == 19.99

    def test_04_delete_subscription(self):
        if not self.subscription_id:
            pytest.skip("No subscription ID available")
            
        response = requests.delete(f"{BASE_URL}/subscriptions/{self.subscription_id}")
        assert response.status_code == 200
        
        # Verify deletion
        response = requests.get(f"{BASE_URL}/subscriptions/")
        data = response.json()
        deleted_sub = next((sub for sub in data if sub["_id"] == self.subscription_id), None)
        assert deleted_sub is None

    def test_05_validation_required_fields(self):
        invalid_subscription = {
            "name": "",  # Empty name
            "price": -10,  # Negative price
            "renewal_date": "invalid_date",
            "duration": "invalid_duration",
            "type": "invalid_type",
            "category": "invalid_category",
            "is_shared": "not_boolean"
        }
        response = requests.post(f"{BASE_URL}/subscriptions/", json=invalid_subscription)
        assert response.status_code in [400, 422]  # FastAPI validation error

    def test_06_shared_subscription(self):
        shared_subscription = self.test_subscription.copy()
        shared_subscription["is_shared"] = True
        shared_subscription["shared_with"] = ["user1@test.com", "user2@test.com"]
        
        response = requests.post(f"{BASE_URL}/subscriptions/", json=shared_subscription)
        assert response.status_code == 200
        data = response.json()
        assert data["is_shared"] == True
        assert len(data["shared_with"]) == 2
        
        # Cleanup
        if data.get("_id"):
            requests.delete(f"{BASE_URL}/subscriptions/{data['_id']}")

if __name__ == "__main__":
    pytest.main(["-v", "backend_test.py"])