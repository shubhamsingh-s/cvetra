import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

logger = logging.getLogger('backend.db')

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = os.getenv('MONGO_DB', 'cvetra')

# create client lazily to avoid side-effects at import time in some environments
_client: AsyncIOMotorClient | None = None
_db = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        logger.debug('Initializing MongoDB client')
        _client = AsyncIOMotorClient(MONGO_URI)
    return _client


def get_db():
    global _db
    if _db is None:
        _db = get_client()[DB_NAME]
    return _db


def get_jobs_collection():
    return get_db()['jobs']


def get_candidates_collection():
    return get_db()['candidates']


def get_users_collection():
    return get_db()['users']


def get_resumes_collection():
    return get_db()['resumes']


def get_matches_collection():
    return get_db()['matches']


async def ensure_indexes():
    """Create useful indexes for jobs and candidates collections.

    Includes compound indexes to support ranking and common queries.
    """
    db = get_db()
    jobs = db['jobs']
    candidates = db['candidates']
    try:
        logger.info('Ensuring MongoDB indexes')
        # Index job title for quick search
        await jobs.create_index('title')
        # Compound index for candidate ranking/filtering: job_id + ats_score desc + semantic_score desc
        await candidates.create_index([('job_id', 1), ('analysis.ats_score', -1), ('analysis.semantic_score', -1)])
    # Single-field index for job_id queries
        await db['matches'].create_index([('jobId', 1)])
        await db['matches'].create_index([('resumeId', 1)])
        await candidates.create_index([('job_id', 1)])
    except Exception as e:
        logger.exception('Failed to ensure indexes: %s', e)


def is_connected() -> bool:
    try:
        # quick check: ping the server
        client = get_client()
        client.admin.command('ping')
        return True
    except Exception as e:
        logger.debug('MongoDB ping failed: %s', e)
        return False


async def wait_until_available(timeout: int = 10):
    """Wait for MongoDB to become available up to `timeout` seconds."""
    deadline = asyncio.get_event_loop().time() + timeout
    while True:
        if is_connected():
            logger.info('MongoDB is available')
            return True
        if asyncio.get_event_loop().time() > deadline:
            logger.warning('Timed out waiting for MongoDB')
            return False
        await asyncio.sleep(0.5)
