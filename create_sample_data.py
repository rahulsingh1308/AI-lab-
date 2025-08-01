import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Create sample sales data
def create_sales_data():
    np.random.seed(42)
    n_records = 1000
    
    # Generate sample data
    start_date = datetime(2023, 1, 1)
    dates = [start_date + timedelta(days=x) for x in range(365)]
    
    sales_data = {
        'order_id': [f'ORD-{str(i).zfill(6)}' for i in range(1, n_records + 1)],
        'customer_id': [f'CUST-{str(np.random.randint(1, 201)).zfill(4)}' for _ in range(n_records)],
        'product_id': [f'PROD-{str(np.random.randint(1, 51)).zfill(3)}' for _ in range(n_records)],
        'order_date': np.random.choice(dates, n_records),
        'quantity': np.random.randint(1, 10, n_records),
        'unit_price': np.round(np.random.uniform(10, 500, n_records), 2),
        'discount': np.round(np.random.uniform(0, 0.2, n_records), 2),
        'sales_rep': np.random.choice(['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'], n_records),
        'region': np.random.choice(['North', 'South', 'East', 'West'], n_records),
        'category': np.random.choice(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'], n_records)
    }
    
    df = pd.DataFrame(sales_data)
    df['total_amount'] = df['quantity'] * df['unit_price'] * (1 - df['discount'])
    
    return df

# Create sample customer data
def create_customer_data():
    np.random.seed(123)
    n_customers = 200
    
    first_names = ['John', 'Jane', 'Mike', 'Sarah', 'Tom', 'Lisa', 'David', 'Emma', 'Chris', 'Amy']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
    
    customer_data = {
        'customer_id': [f'CUST-{str(i).zfill(4)}' for i in range(1, n_customers + 1)],
        'first_name': np.random.choice(first_names, n_customers),
        'last_name': np.random.choice(last_names, n_customers),
        'email': [f'{fn.lower()}.{ln.lower()}@email.com' for fn, ln in zip(np.random.choice(first_names, n_customers), np.random.choice(last_names, n_customers))],
        'age': np.random.randint(18, 80, n_customers),
        'gender': np.random.choice(['Male', 'Female'], n_customers),
        'city': np.random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'], n_customers),
        'state': np.random.choice(['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'], n_customers),
        'registration_date': np.random.choice(pd.date_range('2020-01-01', '2023-12-31'), n_customers),
        'is_premium': np.random.choice([True, False], n_customers, p=[0.3, 0.7]),
        'total_spent': np.round(np.random.uniform(50, 5000, n_customers), 2)
    }
    
    return pd.DataFrame(customer_data)

# Create sample product data
def create_product_data():
    np.random.seed(456)
    n_products = 50
    
    product_names = [
        'Laptop Pro', 'Wireless Mouse', 'Keyboard Deluxe', 'Monitor 27"', 'Tablet Air',
        'Smartphone X', 'Headphones', 'Speaker Bluetooth', 'Camera DSLR', 'Printer Laser',
        'T-Shirt Cotton', 'Jeans Classic', 'Sneakers Sport', 'Jacket Winter', 'Dress Summer',
        'Novel Mystery', 'Cookbook Italian', 'Biography Famous', 'Textbook Science', 'Comic Adventure',
        'Garden Tool Set', 'Plant Pot Large', 'Fertilizer Organic', 'Seeds Vegetable', 'Hose Garden',
        'Tennis Racket', 'Soccer Ball', 'Basketball', 'Yoga Mat', 'Dumbbells Set'
    ]
    
    product_data = {
        'product_id': [f'PROD-{str(i).zfill(3)}' for i in range(1, n_products + 1)],
        'product_name': np.random.choice(product_names, n_products, replace=False),
        'category': np.random.choice(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'], n_products),
        'brand': np.random.choice(['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'], n_products),
        'price': np.round(np.random.uniform(10, 500, n_products), 2),
        'cost': np.round(np.random.uniform(5, 300, n_products), 2),
        'weight_kg': np.round(np.random.uniform(0.1, 10, n_products), 2),
        'dimensions': [f'{np.random.randint(5, 50)}x{np.random.randint(5, 50)}x{np.random.randint(5, 50)}' for _ in range(n_products)],
        'in_stock': np.random.randint(0, 1000, n_products),
        'rating': np.round(np.random.uniform(1, 5, n_products), 1),
        'reviews_count': np.random.randint(0, 1000, n_products)
    }
    
    df = pd.DataFrame(product_data)
    df['profit_margin'] = (df['price'] - df['cost']) / df['price']
    
    return df

# Create and save the data
if __name__ == "__main__":
    # Create directories if they don't exist
    os.makedirs('data/sales_data', exist_ok=True)
    os.makedirs('data/customer_data', exist_ok=True)
    os.makedirs('data/product_data', exist_ok=True)
    
    # Generate and save sales data
    sales_df = create_sales_data()
    sales_df.to_csv('data/sales_data/sales_2023.csv', index=False)
    sales_df.to_parquet('data/sales_data/sales_2023.parquet', index=False)
    
    # Generate and save customer data
    customer_df = create_customer_data()
    customer_df.to_csv('data/customer_data/customers.csv', index=False)
    customer_df.to_parquet('data/customer_data/customers.parquet', index=False)
    
    # Generate and save product data
    product_df = create_product_data()
    product_df.to_csv('data/product_data/products.csv', index=False)
    
    # Create additional sales data for 2022
    sales_2022 = create_sales_data()
    sales_2022['order_date'] = sales_2022['order_date'] - timedelta(days=365)
    sales_2022.to_csv('data/sales_data/sales_2022.csv', index=False)
    
    print("Sample data created successfully!")
    print("\nSales data shape:", sales_df.shape)
    print("Customer data shape:", customer_df.shape)
    print("Product data shape:", product_df.shape)
    
    print("\nFiles created:")
    print("- data/sales_data/sales_2023.csv")
    print("- data/sales_data/sales_2023.parquet")
    print("- data/sales_data/sales_2022.csv")
    print("- data/customer_data/customers.csv")
    print("- data/customer_data/customers.parquet")
    print("- data/product_data/products.csv")