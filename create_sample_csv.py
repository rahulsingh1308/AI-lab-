import csv
import os
from datetime import datetime, timedelta
import random

def create_sales_csv():
    """Create sample sales data CSV"""
    os.makedirs('data/sales_data', exist_ok=True)
    
    # Sample data
    sales_reps = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown']
    regions = ['North', 'South', 'East', 'West']
    categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports']
    
    # Create 2023 sales data
    with open('data/sales_data/sales_2023.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['order_id', 'customer_id', 'product_id', 'order_date', 'quantity', 
                     'unit_price', 'discount', 'sales_rep', 'region', 'category', 'total_amount']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for i in range(1, 501):  # 500 records
            quantity = random.randint(1, 10)
            unit_price = round(random.uniform(10, 500), 2)
            discount = round(random.uniform(0, 0.2), 2)
            total_amount = round(quantity * unit_price * (1 - discount), 2)
            
            writer.writerow({
                'order_id': f'ORD-{str(i).zfill(6)}',
                'customer_id': f'CUST-{str(random.randint(1, 101)).zfill(4)}',
                'product_id': f'PROD-{str(random.randint(1, 26)).zfill(3)}',
                'order_date': (datetime(2023, 1, 1) + timedelta(days=random.randint(0, 364))).strftime('%Y-%m-%d'),
                'quantity': quantity,
                'unit_price': unit_price,
                'discount': discount,
                'sales_rep': random.choice(sales_reps),
                'region': random.choice(regions),
                'category': random.choice(categories),
                'total_amount': total_amount
            })

def create_customer_csv():
    """Create sample customer data CSV"""
    os.makedirs('data/customer_data', exist_ok=True)
    
    first_names = ['John', 'Jane', 'Mike', 'Sarah', 'Tom', 'Lisa', 'David', 'Emma', 'Chris', 'Amy']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
    cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia']
    states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA']
    
    with open('data/customer_data/customers.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['customer_id', 'first_name', 'last_name', 'email', 'age', 
                     'gender', 'city', 'state', 'registration_date', 'is_premium', 'total_spent']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for i in range(1, 101):  # 100 customers
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            writer.writerow({
                'customer_id': f'CUST-{str(i).zfill(4)}',
                'first_name': first_name,
                'last_name': last_name,
                'email': f'{first_name.lower()}.{last_name.lower()}{i}@email.com',
                'age': random.randint(18, 80),
                'gender': random.choice(['Male', 'Female']),
                'city': random.choice(cities),
                'state': random.choice(states),
                'registration_date': (datetime(2020, 1, 1) + timedelta(days=random.randint(0, 1460))).strftime('%Y-%m-%d'),
                'is_premium': random.choice(['True', 'False']),
                'total_spent': round(random.uniform(50, 5000), 2)
            })

def create_product_csv():
    """Create sample product data CSV"""
    os.makedirs('data/product_data', exist_ok=True)
    
    product_names = [
        'Laptop Pro', 'Wireless Mouse', 'Keyboard Deluxe', 'Monitor 27"', 'Tablet Air',
        'Smartphone X', 'Headphones', 'Speaker Bluetooth', 'Camera DSLR', 'Printer Laser',
        'T-Shirt Cotton', 'Jeans Classic', 'Sneakers Sport', 'Jacket Winter', 'Dress Summer',
        'Novel Mystery', 'Cookbook Italian', 'Biography Famous', 'Textbook Science', 'Comic Adventure',
        'Garden Tool Set', 'Plant Pot Large', 'Fertilizer Organic', 'Seeds Vegetable', 'Hose Garden',
        'Tennis Racket'
    ]
    
    categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports']
    brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E']
    
    with open('data/product_data/products.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['product_id', 'product_name', 'category', 'brand', 'price', 
                     'cost', 'weight_kg', 'in_stock', 'rating', 'reviews_count']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for i, name in enumerate(product_names, 1):
            price = round(random.uniform(10, 500), 2)
            cost = round(price * random.uniform(0.3, 0.8), 2)
            
            writer.writerow({
                'product_id': f'PROD-{str(i).zfill(3)}',
                'product_name': name,
                'category': random.choice(categories),
                'brand': random.choice(brands),
                'price': price,
                'cost': cost,
                'weight_kg': round(random.uniform(0.1, 10), 2),
                'in_stock': random.randint(0, 1000),
                'rating': round(random.uniform(1, 5), 1),
                'reviews_count': random.randint(0, 1000)
            })

if __name__ == "__main__":
    print("Creating sample CSV data...")
    
    create_sales_csv()
    print("✓ Created sales_2023.csv")
    
    create_customer_csv()
    print("✓ Created customers.csv")
    
    create_product_csv()
    print("✓ Created products.csv")
    
    print("\nSample data created successfully!")
    print("\nData structure:")
    print("data/")
    print("├── sales_data/")
    print("│   └── sales_2023.csv")
    print("├── customer_data/")
    print("│   └── customers.csv")
    print("└── product_data/")
    print("    └── products.csv")