import { Box, Typography, Card, CardContent, Grid, TextField, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack } from '@mui/material';

const UserManagement = () => {
	const users = [
		{ id: 1, name: 'پارسا', phone: '+98 912 111 2233', status: 'فعال' },
		{ id: 2, name: 'مریم', phone: '+98 935 555 8899', status: 'فعال' },
		{ id: 3, name: 'کیان', phone: '+98 901 777 1122', status: 'مسدود' }
	];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت کاربران</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
								<TextField placeholder="جستجوی کاربر" fullWidth />
								<TextField placeholder="فیلتر وضعیت" fullWidth />
							</Stack>
							<Typography variant="subtitle1" gutterBottom>تعداد کل کاربران: {users.length}</Typography>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>نام</TableCell>
										<TableCell>شماره تماس</TableCell>
										<TableCell>وضعیت</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{users.map(u => (
										<TableRow key={u.id}>
											<TableCell>{u.name}</TableCell>
											<TableCell>{u.phone}</TableCell>
											<TableCell>
												<Chip size="small" label={u.status} color={u.status === 'فعال' ? 'success' : 'default'} />
											</TableCell>
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

export default UserManagement;
