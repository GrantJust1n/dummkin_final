"""
Simple AI Shopping Assistant - Flask API
This file creates a web server that connects your PHP website to Ollama AI.
"""

import os
import re
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from ollama_client import OllamaClient

# Load configuration from .env file
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Allow PHP pages to call this API (CORS = Cross-Origin Resource Sharing)
CORS(app, resources={r"/*": {"origins": "*"}})

# Create Ollama client to talk to AI
ollama_client = OllamaClient()


def get_db_connection():
    """Connect to MySQL database"""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "ecommerce_db")
    )


def search_products(search_text):
    """
    Search for products in database
    Returns a list of products that match the search
    """
    if not search_text:
        return []
    
    # Connect to database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Search in product name and description
    sql = """
        SELECT id, name, description, price, quantity
        FROM products
        WHERE is_active = 1 
        AND status = 'approved'
        AND (name LIKE %s OR description LIKE %s)
        ORDER BY id DESC
        LIMIT 10
    """
    
    # Use % for wildcard search (like "running%" matches "running shoes")
    search_pattern = f"%{search_text}%"
    cursor.execute(sql, (search_pattern, search_pattern))
    
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return products


def get_user_cart(user_id):
    """
    Get items in user's shopping cart
    Returns a string describing the cart
    """
    if not user_id:
        return ""
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get cart items with product details
    sql = """
        SELECT c.product_id, c.quantity, p.name, p.price
        FROM cart c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = %s
    """
    cursor.execute(sql, (user_id,))
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    
    if not items:
        return ""
    
    # Format cart as text
    cart_text = "Items in cart:\n"
    total = 0
    for item in items:
        price = float(item['price'])
        qty = int(item['quantity'])
        total += price * qty
        cart_text += f"- {item['name']} x{qty} — ₱{price:.2f}\n"
    cart_text += f"Total: ₱{total:.2f}"
    
    return cart_text


def add_to_cart(user_id, product_id, quantity=1):
    """
    Add a product to user's cart
    Returns success message
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Check if product already in cart
    cursor.execute(
        "SELECT quantity FROM cart WHERE user_id = %s AND product_id = %s",
        (user_id, product_id)
    )
    existing = cursor.fetchone()
    
    if existing:
        # Update quantity
        new_qty = int(existing['quantity']) + quantity
        cursor.execute(
            "UPDATE cart SET quantity = %s WHERE user_id = %s AND product_id = %s",
            (new_qty, user_id, product_id)
        )
    else:
        # Add new item
        cursor.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
            (user_id, product_id, quantity)
        )
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return f"Added {quantity} item(s) to your cart!"


# --- NEW FUNCTION: DELETE FROM CART ---
def delete_from_cart(user_id, product_id):
    """
    Remove a product from user's cart
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM cart WHERE user_id = %s AND product_id = %s",
        (user_id, product_id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return True
# --------------------------------------


def check_if_add_to_cart(message):
    """Check if user wants to add something to cart"""
    message_lower = message.lower()
    if "add" in message_lower and "cart" in message_lower:
        return True
    if "put" in message_lower and "cart" in message_lower:
        return True
    return False


def find_product_id_in_message(message, products):
    """
    Try to find which product user is talking about
    Looks for product ID (like #1) or product name
    """
    message_lower = message.lower()
    
    # First, check for product ID like "#1" or "id 1"
    match = re.search(r'#(\d+)', message_lower)
    if match:
        product_id = int(match.group(1))
        for product in products:
            if product['id'] == product_id:
                return product
    
    # If no ID found, try to match product name
    for product in products:
        product_name = product['name'].lower()
        if product_name in message_lower:
            return product
    
    # If nothing found, return first product (or None)
    return products[0] if products else None


@app.route("/health", methods=["GET"])
def health():
    """Check if server is running"""
    return jsonify({"status": "ok"})


@app.route("/ask", methods=["POST"])
def ask():
    """
    Main endpoint - handles all chat messages from frontend
    This is where the magic happens!
    """
    # Get the user's message from the request
    data = request.get_json()
    user_message = data.get("prompt", "").strip()
    user_id = data.get("user_id")
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    
    try:
        # Step 1: Search for products based on user's message
        products = search_products(user_message)
        
        # If no products found, get some recent products to show
        if not products:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, name, description, price, quantity
                FROM products
                WHERE is_active = 1
                AND status = 'approved'
                ORDER BY id DESC
                LIMIT 5
            """)
            products = cursor.fetchall()
            cursor.close()
            conn.close()
        
        # Step 2: Check for Actions (ADD or DELETE)
        wants_to_add = check_if_add_to_cart(user_message)
        message_lower = user_message.lower()
        wants_to_delete = "delete" in message_lower or "remove" in message_lower

        if wants_to_add and products:
            # User wants to add something to cart
            if not user_id:
                return jsonify({"answer": "Please log in to add items to your cart."})
            
            # Find which product they want
            product = find_product_id_in_message(user_message, products)
            
            if product:
                # Add to cart
                add_to_cart(user_id, product['id'], 1)
                return jsonify({
                    "answer": f"Added {product['name']} (₱{product['price']:.2f}) to your cart!"
                })
            else:
                product_list = ", ".join([f"#{p['id']} {p['name']}" for p in products[:5]])
                return jsonify({
                    "answer": f"Which product? Here are some options: {product_list}"
                })

        # --- NEW DELETE LOGIC START ---
        elif wants_to_delete and products:
            if not user_id:
                return jsonify({"answer": "Please log in to manage your cart."})
            
            product = find_product_id_in_message(user_message, products)
            
            if product:
                delete_from_cart(user_id, product['id'])
                # Get updated cart
                new_cart = get_user_cart(user_id)
                if not new_cart:
                    new_cart = "Your cart is now empty."
                
                return jsonify({
                    "answer": f"Done! I removed {product['name']} from your cart.\n\n{new_cart}"
                })
            else:
                return jsonify({"answer": "I'm not sure which item you want to remove. Please say the product name."})
        # --- NEW DELETE LOGIC END ---
        
        # Step 3: Get user's cart info (if logged in)
        cart_info = get_user_cart(user_id) if user_id else ""
        
        # Step 4: Build product list as text for AI
        product_text = "Available products:\n"
        for product in products:
            product_text += f"#{product['id']} {product['name']} — ₱{product['price']:.2f} "
            product_text += f"(Stock: {product['quantity']})\n"
            product_text += f"Description: {product.get('description', 'No description')}\n\n"
        
        # Step 5: Create the full prompt for AI
        ai_prompt = product_text
        
        if cart_info:
            ai_prompt += f"\n{cart_info}\n"
        
        ai_prompt += f"\nUser question: {user_message}"
        
        # Step 6: Tell AI how to behave
        system_message = os.getenv("OLLAMA_SYSTEM_PROMPT", 
            "You are Doki, the Donut AI Assistant. Help users find donuts and manage their cart."
        )
        
        # Step 7: Send to Ollama AI
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": ai_prompt}
        ]
        
        ai_response = ollama_client.chat(messages)
        
        # Step 8: Extract the answer from AI response
        answer = ai_response.get("message", {}).get("content", "Sorry, I couldn't understand that.")
        
        # Step 9: Send answer back to frontend
        return jsonify({"answer": answer})
        
    except Exception as e:
        # If something goes wrong, return error
        return jsonify({"error": str(e)}), 500


# Start the server
if __name__ == "__main__":
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "5055"))
    print(f"Starting server on http://{host}:{port}")
    app.run(host=host, port=port, debug=True)