import { Box, Typography, Card, CardContent, Grid, TextField, Button, List, ListItem, ListItemText, IconButton, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const RulesManagement = () => {
	const rules = [
		{ id: 1, text: 'پوشیدن یونیفرم در تمام زمانها الزامی است.' },
		{ id: 2, text: 'استفاده از تلفن همراه در ساعات کاری ممنوع است.' },
		{ id: 3, text: 'رعایت نظافت و بهداشت محیط کار ضروری است.' }
	];
	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت قوانین</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
								<TextField fullWidth label="قانون جدید" placeholder="متن قانون را وارد کنید" />
								<Button variant="contained">افزودن قانون</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>فهرست قوانین</Typography>
							<List>
								{rules.map(r => (
									<ListItem key={r.id} divider secondaryAction={
										<Stack direction="row" spacing={1}>
											<IconButton edge="end"><Edit /></IconButton>
											<IconButton edge="end" color="error"><Delete /></IconButton>
										</Stack>
									}>
									<ListItemText primary={r.text} />
								</ListItem>
								))}
							</List>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default RulesManagement;
