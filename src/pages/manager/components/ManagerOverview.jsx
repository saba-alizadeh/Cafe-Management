import { Box, Grid, Typography } from '@mui/material';
import {
	TrendingUpRounded,
	AssignmentTurnedInRounded,
	EventAvailableRounded,
	RestaurantRounded,
	MonetizationOnRounded,
	SentimentSatisfiedAltRounded,
	TaskAltRounded
} from '@mui/icons-material';

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
	{
		id: 'branch-sales-growth',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'رشد فروش شعبه',
			icon: <TrendingUpRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.blush,
			metrics: [
				{ label: 'امروز', value: '12.6%', trend: 'up' },
				{ label: '۷ روز گذشته', value: '4.3%', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '9.8%', trend: 'up' }
			]
		}
	},
	{
		id: 'completed-orders',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'سفارش‌های تکمیل شده',
			icon: <AssignmentTurnedInRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.sageTint,
			metrics: [
				{ label: 'امروز', value: '28', trend: 'up' },
				{ label: '۷ روز گذشته', value: '185', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '790', trend: 'up' }
			]
		}
	},
	{
		id: 'active-reservations',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'رزروهای فعال',
			icon: <EventAvailableRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.peach,
			metrics: [
				{ label: 'امروز', value: '6', trend: 'neutral' },
				{ label: '۷ روز گذشته', value: '42', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '168', trend: 'up' }
			]
		}
	},
	{
		id: 'online-order-share',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'سهم سفارش آنلاین',
			icon: <RestaurantRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.peach,
			metrics: [
				{ label: 'امروز', value: '58%', trend: 'up' },
				{ label: '۷ روز گذشته', value: '52%', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '49%', trend: 'up' }
			]
		}
	},
	{
		id: 'weekly-gross-revenue',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'درآمد ناخالص هفته',
			icon: <MonetizationOnRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.coral,
			metrics: [
				{ label: 'امروز', value: '8,540,000', trend: 'up' },
				{ label: '۷ روز گذشته', value: '62,350,000', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '247,800,000', trend: 'up' }
			]
		}
	},
	{
		id: 'customer-satisfaction',
		grid: { xs: 12, sm: 6, md: 6 },
		props: {
			title: 'رضایت مشتریان',
			icon: <SentimentSatisfiedAltRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.amber,
			metrics: [
				{ label: 'امروز', value: '4.8 / 5', trend: 'up' },
				{ label: '۷ روز گذشته', value: '4.6 / 5', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '4.5 / 5', trend: 'up' }
			]
		}
	},
	{
		id: 'team-efficiency',
		grid: { xs: 12, sm: 6, md: 6 },
		props: {
			title: 'کارایی تیم',
			icon: <TaskAltRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.sand,
			metrics: [
				{ label: 'امروز', value: '92%', trend: 'up' },
				{ label: '۷ روز گذشته', value: '88%', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '85%', trend: 'up' }
			]
		}
	}
];

const ManagerOverview = () => (
	<Box sx={{ width: '100%', direction: 'rtl', mt: 2 }}>
		<Box sx={{ maxWidth: 1240, width: '100%', ml: 'auto' }}>
			<Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
				نمای کلی مدیر شعبه
			</Typography>
			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
				شاخص‌های کلیدی عملکرد شعبه و روند رشد روزانه
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
						<OverviewCard {...props} />
					</Grid>
				))}
			</Grid>
		</Box>
	</Box>
);

export default ManagerOverview;
