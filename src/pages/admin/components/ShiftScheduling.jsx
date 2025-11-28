import { Box, Typography, Card, CardContent, Grid, TextField, Button, MenuItem, Stack } from '@mui/material';

const ShiftScheduling = () => {
	const employees = ['علیرضا', 'سارا', 'حامد'];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>زمانبندی شیفت</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>تعریف/ویرایش شیفت</Typography>
							<Stack spacing={2}>
								<TextField select label="کارمند" fullWidth>
									{employees.map(e => (
										<MenuItem key={e} value={e}>{e}</MenuItem>
									))}
								</TextField>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
									<TextField type="time" label="ساعت شروع" InputLabelProps={{ shrink: true }} fullWidth />
									<TextField type="time" label="ساعت پایان" InputLabelProps={{ shrink: true }} fullWidth />
								</Stack>
								<Button variant="contained">ذخیره شیفت</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>شیفتهای فعلی</Typography>
							<Typography variant="body2" color="text.secondary">فهرست شیفتهای تخصیصدادهشده در اینجا نمایش داده میشود.</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ShiftScheduling;
