import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Rating, Stack, TextField, Button } from '@mui/material';

const CustomerFeedback = () => {
	const feedback = [
		{ id: 1, user: 'پارسا', rating: 4, comment: 'قهوه و فضا عالی بود.' },
		{ id: 2, user: 'مریم', rating: 5, comment: 'لاتهآرت خیلی زیبا!' },
		{ id: 3, user: 'کیان', rating: 3, comment: 'کمی تاخیر در سرویس.' }
	];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>بازخورد مشتریان</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={7}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>نظرات</Typography>
							<List>
								{feedback.map(f => (
									<ListItem key={f.id} divider>
										<ListItemText primary={f.user} secondary={f.comment} />
										<Rating value={f.rating} readOnly />
									</ListItem>
								))}
							</List>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={5}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>مدیریت</Typography>
							<Stack spacing={2}>
								<TextField label="جستجوی نظر" fullWidth />
								<Button variant="outlined">خروجی گرفتن</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default CustomerFeedback;
