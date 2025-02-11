from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn
import os
import logging
from pathlib import Path
from enum import Enum

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url)
db = client.subscription_manager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SubscriptionDuration(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMI_ANNUAL = "semi-annual"
    ANNUAL = "annual"

class SubscriptionType(str, Enum):
    PERSONAL = "personal"
    OFFICIAL = "official"

class SubscriptionCategory(str, Enum):
    STREAMING = "streaming"
    CLOUD = "cloud"
    DEVELOPMENT = "development"
    PRODUCTIVITY = "productivity"
    COMMUNICATION = "communication"
    OTHER = "other"

class Subscription(BaseModel):
    name: str
    price: float
    renewal_date: datetime
    duration: SubscriptionDuration
    type: SubscriptionType
    category: SubscriptionCategory
    is_shared: bool
    shared_with: Optional[List[str]] = []

@app.get("/")
async def root():
    return {"message": "Digital Subscription Manager API"}

@app.post("/subscriptions/")
async def create_subscription(subscription: Subscription):
    try:
        result = await db.subscriptions.insert_one(subscription.dict())
        created_subscription = await db.subscriptions.find_one({"_id": result.inserted_id})
        created_subscription["_id"] = str(created_subscription["_id"])
        return created_subscription
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create subscription")

@app.get("/subscriptions/")
async def get_subscriptions():
    try:
        subscriptions = []
        cursor = db.subscriptions.find({})
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            subscriptions.append(doc)
        return subscriptions
    except Exception as e:
        logger.error(f"Error fetching subscriptions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch subscriptions")

@app.delete("/subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str):
    try:
        from bson import ObjectId
        result = await db.subscriptions.delete_one({"_id": ObjectId(subscription_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")
        return {"message": "Subscription deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete subscription")

@app.put("/subscriptions/{subscription_id}")
async def update_subscription(subscription_id: str, subscription: Subscription):
    try:
        from bson import ObjectId
        result = await db.subscriptions.update_one(
            {"_id": ObjectId(subscription_id)},
            {"$set": subscription.dict()}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")
        return {"message": "Subscription updated successfully"}
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update subscription")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
