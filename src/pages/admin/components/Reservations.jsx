import { Box, Typography, Card, CardContent, Grid, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip } from '@mui/material';
import { TableRestaurant, Person, People } from '@mui/icons-material';

const Reservations = () => {
	// Mock data - in real app, this would come from API
	// Structure: table details, number of people, customer username
	const reservations = [
		{
			id: 1,
			table: { name: 'میز ۵', number: 5, capacity: 4, location: 'سالن اصلی' },
			people: 2,
			customer: { username: 'customer1', name: 'مهدی احمدی', phone: '09123456789' },
			date: '1403/10/15',
			time: '10:30',
			status: 'confirmed'
		},
		{
			id: 2,
			table: { name: 'میز ۲', number: 2, capacity: 2, location: 'تراس' },
			people: 2,
			customer: { username: 'customer2', name: 'ندا رضایی', phone: '09123456790' },
			date: '1403/10/15',
			time: '12:00',
			status: 'confirmed'
		},
		{
			id: 3,
			table: { name: 'میز ۸', number: 8, capacity: 6, location: 'سالن اصلی' },
			people: 4,
			customer: { username: 'customer3', name: 'آرمان کریمی', phone: '09123456791' },
			date: '1403/10/16',
			time: '14:00',
			status: 'pending'
		},
		{
			id: 4,
			table: { name: 'میز ۳', number: 3, capacity: 4, location: 'سالن اصلی' },
			people: 3,
			customer: { username: 'customer4', name: 'لاله محمدی', phone: '09123456792' },
			date: '1403/10/17',
			time: '13:00',
			status: 'cancelled'
		}
	];

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed':
				return 'success';
			case 'pending':
				return 'warning';
			case 'cancelled':
				return 'error';
			default:
				return 'default';
		}
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case 'confirmed':
				return 'تأیید شده';
			case 'pending':
				return 'در انتظار';
			case 'cancelled':
				return 'لغو شده';
			default:
				return status;
		}
	};

	return (
		<Box>
			<Typography variant="h4" gutterBottom>رزروها</Typography>
			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
				مشاهده و مدیریت رزروهای میزها
			</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>جزئیات میز</TableCell>
							<TableCell>تعداد نفرات</TableCell>
							<TableCell>نام کاربری مشتری</TableCell>
							<TableCell>نام مشتری</TableCell>
							<TableCell>تاریخ و زمان</TableCell>
							<TableCell>وضعیت</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{reservations.map((reservation) => (
							<TableRow key={reservation.id} hover>
								<TableCell>
									<Box display="flex" alignItems="center" gap={1}>
										<TableRestaurant color="primary" />
										<Box>
											<Typography variant="body2" fontWeight="bold">
												{reservation.table.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												ظرفیت: {reservation.table.capacity} نفر • {reservation.table.location}
											</Typography>
										</Box>
									</Box>
								</TableCell>
								<TableCell>
									<Box display="flex" alignItems="center" gap={1}>
										<People color="action" />
										<Typography variant="body2">{reservation.people} نفر</Typography>
									</Box>
								</TableCell>
								<TableCell>
									<Typography variant="body2" fontWeight="medium">
										{reservation.customer.username}
									</Typography>
								</TableCell>
								<TableCell>
									<Box display="flex" alignItems="center" gap={1}>
										<Person color="action" />
										<Box>
											<Typography variant="body2">{reservation.customer.name}</Typography>
											<Typography variant="caption" color="text.secondary">
												{reservation.customer.phone}
											</Typography>
										</Box>
									</Box>
								</TableCell>
								<TableCell>
									<Typography variant="body2">{reservation.date}</Typography>
									<Typography variant="caption" color="text.secondary">
										{reservation.time}
									</Typography>
								</TableCell>
								<TableCell>
									<Chip
										label={getStatusLabel(reservation.status)}
										color={getStatusColor(reservation.status)}
										size="small"
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default Reservations;
