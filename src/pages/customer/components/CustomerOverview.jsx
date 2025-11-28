import { Box, Grid, Typography } from '@mui/material';
import {
	FavoriteRounded,
	ShoppingBagRounded,
	ScheduleRounded,
	LocalOfferRounded,
	AccountBalanceWalletRounded,
	StarBorderRounded,
	HistoryRounded
} from '@mui/icons-material';

import OverviewCard from '../../../components/dashboard/OverviewCard';

const palette = {
	blush: '#fff4ef',
	peach: '#fceee9',
	coral: '#f7d4c3',
	amber: '#f8e4ce',
	sand: '#f5d1b3',
	sageSoft: '#e8f0eb',
	sageTint: '#edf5ef',
	accent: '#667b68',
	accentAlt: '#7a9280'
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
		id: 'completed-orders',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'سفارش‌های تکمیل شده',
			icon: <ShoppingBagRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.sageTint,
			metrics: [
				{ label: 'امروز', value: '4', trend: 'up' },
				{ label: '۷ روز گذشته', value: '19', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '76', trend: 'up' }
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
		id: 'wallet-balance',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'کیف پول و امتیاز',
			icon: <AccountBalanceWalletRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.coral,
			metrics: [
				{ label: 'امروز', value: '245,000 ریال', trend: 'up' },
				{ label: '۷ روز گذشته', value: '1,380,000 ریال', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '4,360,000 ریال', trend: 'up' }
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
	{
		id: 'history-overview',
		grid: { xs: 12, sm: 6, md: 6 },
		props: {
			title: 'مرور سفارش‌ها',
			icon: <HistoryRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.sand,
			metrics: [
				{ label: 'امروز', value: '2 سفارش در صف', trend: 'neutral' },
				{ label: '۷ روز گذشته', value: '9 دسته سفارش', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '36 تجربه', trend: 'up' }
			]
		}
	}
];

const CustomerOverview = () => (
	<Box sx={{ width: '100%', direction: 'rtl', mt: 2 }}>
		<Box sx={{ maxWidth: 1240, width: '100%', ml: 'auto' }}>
			<Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
				نمای کلی مشتری
			</Typography>
			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
				خلاصه‌ای از سفارش‌ها، رزروها و مزایای فعال شما
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
