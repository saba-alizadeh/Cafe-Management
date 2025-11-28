import { Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Stack, TextField, Button } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const InventoryControl = () => {
	const items = [
		{ id: 1, name: 'دانه قهوه', qty: 120, unit: 'کیلو' },
		{ id: 2, name: 'شیر', qty: 60, unit: 'لیتر' },
		{ id: 3, name: 'لیوان یکبارمصرف', qty: 1500, unit: 'عدد' }
	];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>کنترل موجودی</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={2} spacing={2}>
								<TextField placeholder="جستجوی کالا" fullWidth />
								<Button variant="contained">افزودن کالا</Button>
							</Stack>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>کالا</TableCell>
										<TableCell>موجودی</TableCell>
										<TableCell>واحد</TableCell>
										<TableCell align="right">تغییر موجودی</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{items.map(i => (
										<TableRow key={i.id} hover>
											<TableCell>{i.name}</TableCell>
											<TableCell>{i.qty}</TableCell>
											<TableCell>{i.unit}</TableCell>
											<TableCell align="right">
												<IconButton size="small"><Remove /></IconButton>
												<IconButton size="small" color="primary"><Add /></IconButton>
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

export default InventoryControl;
