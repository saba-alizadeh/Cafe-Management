import { Box, Typography, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableHead, TableRow, Stack } from '@mui/material';

const EmployeeManagement = () => {
	const employees = [
		{ id: 1, name: 'علیرضا', role: 'باریستا', shift: '08:00-16:00', status: 'حاضر', checkIn: '08:02', checkOut: '--' },
		{ id: 2, name: 'سارا', role: 'صندوقدار', shift: '12:00-20:00', status: 'مرخصی', checkIn: '--', checkOut: '--' },
		{ id: 3, name: 'حامد', role: 'سرآشپز', shift: '16:00-00:00', status: 'حاضر', checkIn: '15:55', checkOut: '--' }
	];

	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت کارکنان</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
								<Typography variant="h6">حضور و غیاب و نقشها</Typography>
								<Stack direction="row" spacing={1}>
									<Button variant="contained">افزودن کارمند</Button>
									<Button variant="outlined">خروجی گرفتن</Button>
								</Stack>
							</Stack>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>نام</TableCell>
										<TableCell>نقش/سمت</TableCell>
										<TableCell>شیفت</TableCell>
										<TableCell>وضعیت</TableCell>
										<TableCell>ورود</TableCell>
										<TableCell>خروج</TableCell>
										<TableCell align="right">اقدامات</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{employees.map(e => (
										<TableRow key={e.id} hover>
											<TableCell>{e.name}</TableCell>
											<TableCell>{e.role}</TableCell>
											<TableCell>{e.shift}</TableCell>
											<TableCell>
												<Chip size="small" label={e.status} color={e.status === 'حاضر' ? 'success' : 'warning'} />
											</TableCell>
											<TableCell>{e.checkIn}</TableCell>
											<TableCell>{e.checkOut}</TableCell>
											<TableCell align="right">
												<Stack direction="row" spacing={1} justifyContent="flex-end">
													<Button size="small">ویرایش</Button>
													<Button size="small" color="error">حذف</Button>
												</Stack>
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

export default EmployeeManagement;
