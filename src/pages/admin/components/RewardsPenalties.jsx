import { Box, Typography, Card, CardContent, Grid, TextField, Button, MenuItem, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';

const RewardsPenalties = () => {
	const employees = ['علیرضا', 'سارا', 'حامد'];
	const reasons = ['خدمت عالی', 'تاخیر در ورود', 'شکایت مشتری', 'اضافهکاری'];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>پاداش و جریمه</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack spacing={2}>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
									<TextField select label="کارمند" fullWidth>
										{employees.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
									</TextField>
									<TextField select label="دلیل" fullWidth>
										{reasons.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
									</TextField>
								</Stack>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
									<TextField label="مبلغ" type="number" fullWidth />
									<ToggleButtonGroup exclusive>
										<ToggleButton value="bonus">پاداش</ToggleButton>
										<ToggleButton value="penalty">جریمه</ToggleButton>
									</ToggleButtonGroup>
								</Stack>
								<Button variant="contained">ثبت</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default RewardsPenalties;
