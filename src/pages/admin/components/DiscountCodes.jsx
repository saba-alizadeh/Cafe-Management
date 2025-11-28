import { Box, Typography, Card, CardContent, Grid, TextField, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const DiscountCodes = () => {
	const codes = [
		{ id: 1, code: 'OFF10', percent: 10, uses: 34 },
		{ id: 2, code: 'COFFEE20', percent: 20, uses: 12 }
	];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>کدهای تخفیف</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={5}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>ایجاد کد</Typography>
							<Stack spacing={2}>
								<TextField label="کد" fullWidth />
								<TextField label="درصد" type="number" fullWidth />
								<TextField label="حداکثر استفاده" type="number" fullWidth />
								<Button variant="contained">تولید</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={7}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>کدهای موجود</Typography>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>کد</TableCell>
										<TableCell>درصد</TableCell>
										<TableCell>تعداد استفاده</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{codes.map(c => (
										<TableRow key={c.id}>
											<TableCell>{c.code}</TableCell>
											<TableCell>{c.percent}%</TableCell>
											<TableCell>{c.uses}</TableCell>
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

export default DiscountCodes;
