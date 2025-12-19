"""
Database collection name helpers for the restructured database model.

Structure:
- Persons: persons_users, persons_admins, persons_managers
- Cafes: cafes (main info), cafe_employees, cafe_inventory, cafe_offcodes, 
        cafe_products, cafe_rewards, cafe_rules, cafe_shift_schedules
        (all cafe-specific collections use cafe_id for filtering)
"""


def get_persons_users_collection(db):
    """Get the persons_users collection"""
    return db["persons_users"]


def get_persons_admins_collection(db):
    """Get the persons_admins collection"""
    return db["persons_admins"]


def get_persons_managers_collection(db):
    """Get the persons_managers collection"""
    return db["persons_managers"]


def get_cafes_collection(db):
    """Get the cafes collection (main café information)"""
    return db["cafes"]


def get_cafe_employees_collection(db, cafe_id=None):
    """
    Get the cafe_employees collection.
    If cafe_id is provided, returns collection name for that specific cafe.
    Note: In practice, we use cafe_id field for filtering, not separate collections.
    """
    return db["cafe_employees"]


def get_cafe_inventory_collection(db, cafe_id=None):
    """Get the cafe_inventory collection"""
    return db["cafe_inventory"]


def get_cafe_offcodes_collection(db, cafe_id=None):
    """Get the cafe_offcodes collection"""
    return db["cafe_offcodes"]


def get_cafe_products_collection(db, cafe_id=None):
    """Get the cafe_products collection"""
    return db["cafe_products"]


def get_cafe_rewards_collection(db, cafe_id=None):
    """Get the cafe_rewards collection"""
    return db["cafe_rewards"]


def get_cafe_rules_collection(db, cafe_id=None):
    """Get the cafe_rules collection"""
    return db["cafe_rules"]


def get_cafe_shift_schedules_collection(db, cafe_id=None):
    """Get the cafe_shift_schedules collection"""
    return db["cafe_shift_schedules"]


def get_images_collection(db):
    """Get the images collection"""
    return db["images"]


# Helper function to get user collection based on role
def get_user_collection_by_role(db, role):
    """
    Get the appropriate persons collection based on user role.
    Returns the collection for: users, admins, or managers
    """
    if role == "admin":
        return get_persons_admins_collection(db)
    elif role == "manager":
        return get_persons_managers_collection(db)
    else:
        return get_persons_users_collection(db)


# Helper function to find user in any persons collection
async def find_user_in_persons(db, **criteria):
    """
    Search for a user across all persons collections (users, admins, managers).
    Returns (user_doc, collection_name) or (None, None) if not found.
    """
    # Try admins first
    admins_col = get_persons_admins_collection(db)
    user = await admins_col.find_one(criteria)
    if user:
        return user, "persons_admins"
    
    # Try managers
    managers_col = get_persons_managers_collection(db)
    user = await managers_col.find_one(criteria)
    if user:
        return user, "persons_managers"
    
    # Try regular users
    users_col = get_persons_users_collection(db)
    user = await users_col.find_one(criteria)
    if user:
        return user, "persons_users"
    
    return None, None

