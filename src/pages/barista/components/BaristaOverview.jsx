import { Box, Grid, Typography } from '@mui/material';
import {
	RestaurantMenuRounded,
	EventNoteRounded,
	Inventory2Rounded,
	BadgeRounded,
	WarningAmberRounded,
	AssignmentTurnedInRounded,
	CoffeeRounded
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
		id: 'live-orders',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'سفارش‌های در حال اجرا',
			icon: <RestaurantMenuRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.blush,
			metrics: [
				{ label: 'امروز', value: '18', trend: 'up' },
				{ label: '۷ روز گذشته', value: '124', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '486', trend: 'up' }
			]
		}
	},
	{
		id: 'schedule-queue',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'رزروهای پیش‌رو',
			icon: <EventNoteRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.sageTint,
			metrics: [
				{ label: 'امروز', value: '5', trend: 'neutral' },
				{ label: '۷ روز گذشته', value: '31', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '118', trend: 'up' }
			]
		}
	},
	{
		id: 'inventory-alerts',
		grid: { xs: 12, sm: 6, md: 4 },
		props: {
			title: 'هشدار موجودی',
			icon: <Inventory2Rounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.peach,
			metrics: [
				{ label: 'امروز', value: '3 مورد', trend: 'down' },
				{ label: '۷ روز گذشته', value: '11 مورد', trend: 'down' },
				{ label: 'یک ماه گذشته', value: '38 مورد', trend: 'down' }
			]
		}
	},
	{
		id: 'team-coverage',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'پوشش شیفت‌ها',
			icon: <BadgeRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.peach,
			metrics: [
				{ label: 'امروز', value: '95% کامل', trend: 'up' },
				{ label: '۷ روز گذشته', value: '90% برنامه‌ریزی', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '88% ذخیره', trend: 'up' }
			]
		}
	},
	{
		id: 'safety-checks',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'چک‌لیست بهداشت و ایمنی',
			icon: <WarningAmberRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.coral,
			metrics: [
				{ label: 'امروز', value: '7 مورد تایید', trend: 'up' },
				{ label: '۷ روز گذشته', value: '32 مورد کامل', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '128 بازبینی', trend: 'up' }
			]
		}
	},
	{
		id: 'quality-score',
		grid: { xs: 12, sm: 6, md: 6 },
		props: {
			title: 'امتیاز کیفیت سرویس',
			icon: <AssignmentTurnedInRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.amber,
			metrics: [
				{ label: 'امروز', value: '9.2 / 10', trend: 'up' },
				{ label: '۷ روز گذشته', value: '8.8 / 10', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '8.5 / 10', trend: 'up' }
			]
		}
	},
	{
		id: 'signature-drinks',
		grid: { xs: 12, sm: 6, md: 6 },
		props: {
			title: 'نوشیدنی‌های ویژه',
			icon: <CoffeeRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accentAlt,
			background: palette.sand,
			metrics: [
				{ label: 'امروز', value: '750 سرو', trend: 'up' },
				{ label: '۷ روز گذشته', value: '4,980 سرو', trend: 'up' },
				{ label: 'یک ماه گذشته', value: '18,650 سرو', trend: 'up' }
			]
		}
	}
];

const BaristaOverview = () => (
	<Box sx={{ width: '100%', direction: 'rtl', mt: 2 }}>
		<Box sx={{ maxWidth: 1240, width: '100%', ml: 'auto' }}>
			<Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
				نمای کلی باریستا
			</Typography>
			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
				مدیریت لحظه‌ای سفارش‌ها، رزروها و آماده‌سازی نوشیدنی‌ها
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

export default BaristaOverview;
