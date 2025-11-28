import { Box, Typography, Card, CardContent, Grid, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const Reservations = () => {
	const daily = [
		{ id: 1, name: 'مهدی', time: '10:30', people: 2 },
		{ id: 2, name: 'ندا', time: '12:00', people: 4 }
	];
	const monthly = [
		{ id: 101, date: '2025-11-12', name: 'آرمان', people: 3 },
		{ id: 102, date: '2025-11-22', name: 'لاله', people: 6 }
	];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>رزروها</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>روزانه</Typography>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>نام</TableCell>
										<TableCell>ساعت</TableCell>
										<TableCell>نفرات</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{daily.map(r => (
										<TableRow key={r.id}>
											<TableCell>{r.name}</TableCell>
											<TableCell>{r.time}</TableCell>
											<TableCell>{r.people}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>ماهانه</Typography>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>تاریخ</TableCell>
										<TableCell>نام</TableCell>
										<TableCell>نفرات</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{monthly.map(r => (
										<TableRow key={r.id}>
											<TableCell>{r.date}</TableCell>
											<TableCell>{r.name}</TableCell>
											<TableCell>{r.people}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Reservations;
