import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Rating, Stack, TextField, Button, Paper, Divider, Chip } from '@mui/material';
import { RateReview, Search, Download } from '@mui/icons-material';

const CustomerFeedback = () => {
	const feedback = [
		{ id: 1, user: 'پارسا', rating: 4, comment: 'قهوه و فضا عالی بود.' },
		{ id: 2, user: 'مریم', rating: 5, comment: 'لاته آرت خیلی زیبا!' },
		{ id: 3, user: 'کیان', rating: 3, comment: 'کمی تاخیر در سرویس.' }
	];
	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<RateReview sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>بازخورد مشتریان</Typography>
			</Stack>
			<Grid container spacing={3}>
				<Grid item xs={12} md={7}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" alignItems="center" spacing={1} mb={3}>
								<RateReview color="primary" />
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>نظرات</Typography>
								<Chip label={feedback.length} color="primary" size="small" />
							</Stack>
							<Divider sx={{ mb: 2 }} />
							<List sx={{ p: 0 }}>
								{feedback.map((f, index) => (
									<Box key={f.id}>
										<ListItem
											sx={{
												bgcolor: 'background.paper',
												borderRadius: 2,
												mb: 2,
												border: '1px solid',
												borderColor: 'divider'
											}}
										>
											<ListItemText
												primary={
													<Stack direction="row" alignItems="center" spacing={1} mb={1}>
														<Typography variant="body1" sx={{ fontWeight: 500 }}>
															{f.user}
														</Typography>
														<Rating value={f.rating} readOnly size="small" />
													</Stack>
												}
												secondary={f.comment}
											/>
										</ListItem>
										{index < feedback.length - 1 && <Divider sx={{ my: 1 }} />}
									</Box>
								))}
							</List>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={5}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" alignItems="center" spacing={1} mb={3}>
								<Search color="primary" />
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>مدیریت</Typography>
							</Stack>
							<Stack spacing={2.5}>
								<TextField
									label="جستجوی نظر"
									fullWidth
									variant="outlined"
									InputProps={{
										startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
									}}
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
								<Button
									variant="outlined"
									startIcon={<Download />}
									fullWidth
									sx={{ borderRadius: 2, py: 1.5 }}
								>
									خروجی گرفتن
								</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default CustomerFeedback;
