import { Box, Typography, Card, CardContent, Grid, TextField, Button, Stack } from '@mui/material';

const AdvertisingMessages = () => {
	return (
		<Box>
			<Typography variant="h4" gutterBottom>پیامهای تبلیغاتی</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={8}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>ارسال کمپین</Typography>
							<Stack spacing={2}>
								<TextField label="عنوان" fullWidth />
								<TextField label="متن پیام" fullWidth multiline minRows={4} />
								<TextField label="بخش هدف (مثلاً همه، ویژه، جدید)" fullWidth />
								<Stack direction="row" spacing={2}>
									<Button variant="contained">ارسال پیامک</Button>
									<Button variant="outlined">زمانبندی</Button>
								</Stack>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				
			</Grid>
		</Box>
	);
};

export default AdvertisingMessages;
