# Café Management System

A comprehensive multi-role café management system built with React, Vite, and Material-UI. This system provides four distinct user interfaces for different stakeholders in the café ecosystem.

## 🚀 Features

### 1. Admin Panel (CRM-like system)
- **Sales Statistics**: View comprehensive sales data across all café branches
- **Café Management**: Complete CRUD operations for café locations
- **Performance Analytics**: System-wide performance metrics and insights
- **User Management**: Manage all system users and their permissions

### 2. Café Manager Panel
- **Sales Reports**: Monthly and yearly sales analytics
- **Employee Management**: Track performance, assign shifts, manage rewards/penalties
- **Inventory Management**: Real-time stock monitoring and alerts
- **Promotions**: Create and manage discount codes and promotional campaigns
- **Café Settings**: Configure operational settings and policies

### 3. Barista Panel
- **Order Management**: Process and track customer orders in real-time
- **Reservation Management**: Handle table reservations and seating
- **Inventory Status**: Update stock levels and monitor low-stock items
- **Leave Requests**: Submit and track time-off requests

### 4. Customer Panel
- **Menu Ordering**: Browse menu with real-time customization and pricing
- **Reservations**: Make hourly reservations for tables, coworking spaces, or events
- **Order History**: View past orders and reorder favorites
- **Reviews & Feedback**: Rate and review cafés, products, and staff
- **Discount Codes**: Apply promotional codes during checkout

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1 with Vite
- **UI Framework**: Material-UI (MUI) v7.3.4
- **Routing**: React Router DOM v7.9.4
- **Icons**: Material-UI Icons & React Icons
- **Styling**: Emotion (CSS-in-JS)
- **Build Tool**: Vite v7.1.7
- **Linting**: ESLint v9.36.0

## 📁 Project Structure

```
src/
├── components/           # Shared components
├── context/             # React Context (Authentication)
├── pages/               # Page components
│   ├── admin/          # Admin panel pages
│   ├── manager/        # Manager panel pages
│   ├── barista/        # Barista panel pages
│   └── customer/       # Customer panel pages
├── App.jsx             # Main app component with routing
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cafe-management-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication & Roles

The system uses a role-based authentication system with four user types:

### Login Process
1. Select your role (Admin, Manager, Barista, Customer)
2. Enter credentials (username/password)
3. Access role-specific dashboard

### Role Permissions

| Feature | Admin | Manager | Barista | Customer |
|---------|-------|---------|---------|----------|
| View Sales Analytics | ✅ | ✅ (Own café) | ❌ | ❌ |
| Manage Cafés | ✅ | ❌ | ❌ | ❌ |
| Employee Management | ❌ | ✅ | ❌ | ❌ |
| Order Processing | ❌ | ❌ | ✅ | ❌ |
| Make Reservations | ❌ | ❌ | ❌ | ✅ |
| Place Orders | ❌ | ❌ | ❌ | ✅ |

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🎨 UI/UX Features

- **Material Design**: Consistent with Google's Material Design principles
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Intuitive Navigation**: Clear navigation patterns for each user role
- **Real-time Updates**: Live data updates for orders and reservations

## 🔧 Customization

### Adding New Features
1. Create new components in the appropriate role directory
2. Add routes to the respective dashboard component
3. Update navigation menus
4. Implement role-based access control

### Styling
- Global styles in `src/index.css`
- Component-specific styles using Material-UI's `sx` prop
- Theme customization in Material-UI theme provider

## 📊 Data Management

Currently uses mock data. For production, integrate with:
- REST APIs
- GraphQL endpoints
- Real-time WebSocket connections
- Database systems (PostgreSQL, MongoDB, etc.)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Payment integration
- [ ] Inventory forecasting
- [ ] Customer loyalty program
- [ ] Social media integration

---

**Built with ❤️ for the café industry**