import { Box, Grid, Typography } from '@mui/material';
import {
	BarChartRounded,
	EventAvailableRounded,
	InsightsRounded,
	AutorenewRounded,
	AttachMoneyRounded,
	ShowChartRounded,
	PercentRounded,
	BookOnline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import OverviewCard from '../../../components/dashboard/OverviewCard';

const palette = {
	blush: 'var(--color-secondary)',
	peach: 'var(--color-secondary)',
	coral: 'var(--color-secondary)',
	amber: 'var(--color-secondary)',
	sand: 'var(--color-secondary)',
	sageSoft: 'var(--color-secondary)',
	sageTint: 'var(--color-secondary)',
	accent: 'var(--color-accent)',
	accentAlt: 'var(--color-accent)'
};

const cards = [
	// {
		// id: 'reservation-growth',
		// grid: { xs: 12, sm: 6, md: 4 },
		// props: {
		// 	title: 'میزان رشد رزروها',
		// 	icon: <BarChartRounded sx={{ fontSize: 28 }} />,
		// 	accentColor: palette.accentAlt,
		// 	background: palette.blush,
		// 	metrics: [
		// 		{ label: 'امروز', value: '100.00%', trend: 'down' },
		// 		{ label: '۷ روز گذشته', value: '20.00%', trend: 'down' },
		// 		{ label: 'یک ماه گذشته', value: '5.08%', trend: 'up' }
		// 	]
		// }
	// },
	// {
		// id: 'paid-reservations',
		// grid: { xs: 12, sm: 6, md: 4 },
		// props: {
		// 	title: 'رزروهای پرداخت شده',
		// 	icon: <AttachMoneyRounded sx={{ fontSize: 28 }} />,
		// 	accentColor: palette.accent,
		// 	background: palette.sageTint,
		// 	metrics: [
		// 		{ label: 'امروز', value: '0', trend: 'neutral' },
		// 		{ label: '۷ روز گذشته', value: '12', trend: 'up' },
		// 		{ label: 'یک ماه گذشته', value: '62', trend: 'up' }
		// 	]
		// }
	// },
	{
		id: 'incoming-reservations',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'رزروها',
			icon: <BookOnline sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.peach,
			metrics: [
				{ label: 'امروز', value: '2', trend: 'up' },
				{ label: '۷ روز گذشته', value: '35', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '225', trend: 'up' }
			],
			navigateTo: '/admin/reservations'
		}
	},
	// {
		// id: 'sencha-share',
		// grid: { xs: 12, md: 6 },
		// props: {
		// 	title: 'سهم کافه از رزروهای پرداخت شده',
		// 	icon: <AutorenewRounded sx={{ fontSize: 28 }} />,
		// 	accentColor: palette.accent,
		// 	background: palette.peach,
		// 	metrics: [
		// 		{ label: 'امروز', value: '0', trend: 'neutral' },
		// 		{ label: '۷ روز گذشته', value: '8,112,150', trend: 'up' },
		// 		{ label: 'یک ماه گذشته', value: '45,586,350', trend: 'up' }
		// 	]
		// }
	// },
	{
		id: 'total-paid-amount',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'مبلغ کل رزروهای پرداخت شده',
			icon: <AttachMoneyRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.coral,
			metrics: [
				{ label: 'امروز', value: '0', trend: 'neutral' },
				{ label: '۷ روز گذشته', value: '54,746,175', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '30,809,915', trend: 'up' }
			],
			navigateTo: '/admin/analytics'
		}
	},
	// { 

	// 	id: 'sencha-revenue-growth',
	// 	grid: { xs: 12, sm: 6, md: 6 },
	// 	props: {
	// 		title: 'میزان رشد درآمد ',
	// 		icon: <ShowChartRounded sx={{ fontSize: 28 }} />,
	// 		accentColor: palette.accent,
	// 		background: palette.amber,
	// 		metrics: [
	// 			{ label: 'امروز', value: '100.00%', trend: 'down' },
	// 			{ label: '۷ روز گذشته', value: '34.09%', trend: 'down' },
	// 			{ label: 'یک ماه گذشته', value: '8.53%', trend: 'up' }
	// 		]
	// 	}
	// },
	{
		id: 'total-sales-growth',
		grid: { xs: 12, sm: 6, md: 6 },
		props: {
			title: 'میزان رشد کل فروش',
			icon: <PercentRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.sand,
			metrics: [
				{ label: 'امروز', value: '100.00%', trend: 'down' },
				{ label: '۷ روز گذشته', value: '34.21%', trend: 'down' },
				{ label: 'یک ماه گذشته', value: '56.10%', trend: 'up' }
			],
			navigateTo: '/admin/analytics'
		}
	}
];

const AdminOverview = () => {
	const navigate = useNavigate();

	return (
		<Box sx={{ width: '100%', direction: 'rtl', mt: 2 }}>
			<Box sx={{ maxWidth: 1240, width: '100%', ml: 'auto' }}>
				<Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
					نمای کلی پنل مدیریت
				</Typography>
				<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
					آمار سامانه و شاخص‌های اصلی عملکرد در یک نگاه
				</Typography>

				<Grid container spacing={3}>
					{cards.map(({ id, grid, props }) => (
						<Grid
							item
							key={id}
							xs={grid.xs}
							sm={grid.sm ?? grid.xs}
							md={grid.md ?? grid.sm ?? grid.xs}
							lg={grid.lg ?? grid.md ?? grid.sm ?? grid.xs}
						>
							<OverviewCard
								{...props}
								onClick={props.navigateTo ? () => navigate(props.navigateTo) : undefined}
							/>
						</Grid>
					))}
				</Grid>
			</Box>
		</Box>
	);
};

export default AdminOverview;
