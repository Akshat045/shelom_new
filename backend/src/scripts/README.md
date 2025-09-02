# Database Seed Scripts

This directory contains scripts to populate your MongoDB database with sample data for development and testing purposes.

## Available Scripts

### 1. Basic Seed (`seed.ts`)
```bash
npm run seed
```
Creates a basic set of sample data including:
- 5 users (2 admins, 3 employees)
- 8 cartons with various dimensions
- 10 dielines with different specifications
- 10 assignments linking dielines to cartons

**Login Credentials:**
- Admin: `admin@inventory.com` / `admin123`
- Employee: `john.smith@inventory.com` / `employee123`
- Employee: `sarah.johnson@inventory.com` / `employee123`
- Admin: `mike.wilson@inventory.com` / `employee123`
- Employee: `emily.davis@inventory.com` / `employee123`

### 2. Advanced Seed (`seed-advanced.ts`)
```bash
npm run seed:advanced
```
Creates a comprehensive dataset with realistic business scenarios:
- 8 users (3 admins, 5 employees)
- 16 cartons covering different categories:
  - E-commerce packaging (3 types)
  - Electronics boxes (3 types)
  - Specialty boxes (4 types)
  - Food packaging (3 types)
  - Document packaging (3 types)
- 20 dielines with corresponding inserts and protectors
- 50 assignments distributed over the past 30 days

**Login Credentials:**
- Admins: `alex.rodriguez@inventory.com`, `maria.garcia@inventory.com`, `sophie.miller@inventory.com` / `admin123`
- Employees: `emma.thompson@inventory.com`, `james.chen@inventory.com`, `david.kim@inventory.com`, `lisa.wang@inventory.com`, `robert.johnson@inventory.com` / `employee123`

### 3. Database Reset (`reset.ts`)
```bash
npm run db:reset
```
Completely clears all data from the database. Use this to start fresh.

### 4. Development Seed (`seed:dev`)
```bash
npm run seed:dev
```
Runs the basic seed script with nodemon for development purposes.

## Usage Instructions

1. **First Time Setup:**
   ```bash
   cd backend
   npm run seed:advanced
   ```

2. **Reset and Reseed:**
   ```bash
   npm run db:reset
   npm run seed:advanced
   ```

3. **Quick Development Data:**
   ```bash
   npm run seed
   ```

## Data Structure

### Users
- **Admins**: Can manage users, view all data, create/edit/delete all resources
- **Employees**: Can create cartons, dielines, and assignments, view their own data

### Cartons
- Various sizes and types for different use cases
- Realistic quantities and availability tracking
- Associated with the user who created them

### Dielines
- Corresponding to carton types with appropriate tolerances
- Different complexity levels and use cases
- Linked to cartons through assignments

### Assignments
- Historical data spanning different time periods
- Realistic quantity usage patterns
- Proper user attribution

## Environment Requirements

Make sure your `.env` file contains:
```
MONGODB_URI=mongodb://localhost:27017/inventory-system
```

## Troubleshooting

1. **Connection Issues**: Ensure MongoDB is running and the connection string is correct
2. **Permission Errors**: Make sure the database user has read/write permissions
3. **Duplicate Key Errors**: Run `npm run db:reset` first to clear existing data

## Customization

You can modify the seed scripts to:
- Add more users with different roles
- Create industry-specific carton types
- Adjust quantity ranges and availability
- Modify assignment patterns and dates
- Add custom validation scenarios

## Production Warning

⚠️ **Never run these scripts in production!** They will delete all existing data. These scripts are designed for development and testing environments only.