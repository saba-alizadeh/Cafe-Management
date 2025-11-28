import { Box, Typography, Card, CardContent, Grid, Button, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Stack } from '@mui/material';

const ProductManagement = () => {
	const products = [
		{ id: 1, name: 'اسپرسو', price: 3.5, active: true, img: '/images/espresso.png' },
		{ id: 2, name: 'لاته', price: 4.5, active: true, img: '/images/latte.png' },
		{ id: 3, name: 'موکا', price: 5.0, active: false, img: '/images/mocha.png' }
	];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت محصولات</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" mb={2}>
								<Typography variant="h6">محصولات</Typography>
								<Button variant="contained">افزودن محصول</Button>
							</Stack>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>تصویر</TableCell>
										<TableCell>نام</TableCell>
										<TableCell>قیمت</TableCell>
										<TableCell>وضعیت</TableCell>
										<TableCell align="right">اقدامات</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{products.map(p => (
										<TableRow key={p.id} hover>
											<TableCell><Avatar variant="rounded" src={p.img} alt={p.name} /></TableCell>
											<TableCell>{p.name}</TableCell>
											<TableCell>${p.price.toFixed(2)}</TableCell>
											<TableCell>{p.active ? 'فعال' : 'غیرفعال'}</TableCell>
											<TableCell align="right">
												<Stack direction="row" spacing={1} justifyContent="flex-end">
													<Button size="small">ویرایش</Button>
													<Button size="small" color="warning">غیرفعال کردن</Button>
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

export default ProductManagement;
