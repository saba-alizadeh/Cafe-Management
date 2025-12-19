import { Box, Grid, Typography } from '@mui/material';
import {
	FavoriteRounded,
	ScheduleRounded,
	LocalOfferRounded,
	StarBorderRounded
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
		id: 'favourite-cafes',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'کافه‌های مورد علاقه',
			icon: <FavoriteRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.blush,
			metrics: [
				{ label: 'امروز', value: '1 مورد جدید', trend: 'up' },
				{ label: '۷ روز گذشته', value: '3 بروزرسانی', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '8 کافه فعال', trend: 'up' }
			]
		}
	},
	{
		id: 'upcoming-reservations',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'رزروهای پیش‌رو',
			icon: <ScheduleRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.peach,
			metrics: [
				{ label: 'امروز', value: '1', trend: 'neutral' },
				{ label: '۷ روز گذشته', value: '5', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '12', trend: 'up' }
			]
		}
	},
	{
		id: 'active-offers',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'تخفیف‌ها و پیشنهادها',
			icon: <LocalOfferRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.peach,
			metrics: [
				{ label: 'امروز', value: '3 فعال', trend: 'up' },
				{ label: '۷ روز گذشته', value: '7 در دسترس', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '14 استفاده شده', trend: 'up' }
			]
		}
	},
	{
		id: 'rating-activity',
		grid: { xs: 12, sm: 6, md: 6 },
		props: {
			title: 'امتیازها و نظرات',
			icon: <StarBorderRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.amber,
			metrics: [
				{ label: 'امروز', value: '5 ستاره', trend: 'up' },
				{ label: '۷ روز گذشته', value: '12 نظر', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '28 بازخورد', trend: 'up' }
			]
		}
	},
	// Order-related summary cards removed as per requirements
];

const CustomerOverview = () => (
	<Box sx={{ width: '100%', direction: 'rtl', mt: 2 }}>
		<Box sx={{ maxWidth: 1240, width: '100%', ml: 'auto' }}>
			<Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
				نمای کلی مشتری
			</Typography>
			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
				خلاصه‌ای از رزروها، پیشنهادها و فعالیت‌های شما
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

export default CustomerOverview;
