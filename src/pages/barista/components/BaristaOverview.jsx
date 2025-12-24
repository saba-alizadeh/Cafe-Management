import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
	RestaurantMenuRounded,
	EventNoteRounded,
	Inventory2Rounded,
	BadgeRounded,
	WarningAmberRounded,
	AssignmentTurnedInRounded,
	CoffeeRounded,
	ScheduleRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

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
		id: 'my-shifts',
		grid: { xs: 12, md: 6 },
		props: {
			title: 'شیفت‌های من',
			icon: <ScheduleRounded sx={{ fontSize: 28 }} />,
			accentColor: palette.accent,
			background: palette.peach,
			metrics: [],
			navigateTo: '/barista/shifts'
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

const BaristaOverview = () => {
	const navigate = useNavigate();
	const { apiBaseUrl, token, user } = useAuth();
	const [shiftsCount, setShiftsCount] = useState({ today: 0, week: 0, month: 0 });

	useEffect(() => {
		if (token && user) {
			fetchShiftsCount();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl, user]);

	const fetchShiftsCount = async () => {
		try {
			const res = await fetch(`${apiBaseUrl}/shifts`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (res.ok) {
				const allShifts = await res.json();
				const employeeShifts = user?.employee_id 
					? allShifts.filter(s => s.employee_id === user.employee_id)
					: [];
				
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const weekAgo = new Date(today);
				weekAgo.setDate(weekAgo.getDate() - 7);
				const monthAgo = new Date(today);
				monthAgo.setMonth(monthAgo.getMonth() - 1);

				const todayShifts = employeeShifts.filter(s => {
					const shiftDate = new Date(s.date);
					return shiftDate.toDateString() === today.toDateString();
				});

				const weekShifts = employeeShifts.filter(s => {
					const shiftDate = new Date(s.date);
					return shiftDate >= weekAgo && shiftDate <= today;
				});

				const monthShifts = employeeShifts.filter(s => {
					const shiftDate = new Date(s.date);
					return shiftDate >= monthAgo && shiftDate <= today;
				});

				setShiftsCount({
					today: todayShifts.length,
					week: weekShifts.length,
					month: monthShifts.length
				});

				// Update the shifts card with actual data
				const shiftsCard = cards.find(c => c.id === 'my-shifts');
				if (shiftsCard) {
					shiftsCard.props.metrics = [
						{ label: 'امروز', value: todayShifts.length.toString(), trend: 'neutral' },
						{ label: '۷ روز گذشته', value: weekShifts.length.toString(), trend: 'up' },
						{ label: 'یک ماه گذشته', value: monthShifts.length.toString(), trend: 'up' }
					];
				}
			}
		} catch (err) {
			console.error('Error fetching shifts:', err);
		}
	};

	const shiftsCard = cards.find(c => c.id === 'my-shifts');
	if (shiftsCard && shiftsCard.props.metrics.length === 0) {
		shiftsCard.props.metrics = [
			{ label: 'امروز', value: shiftsCount.today.toString(), trend: 'neutral' },
			{ label: '۷ روز گذشته', value: shiftsCount.week.toString(), trend: 'up' },
			{ label: 'یک ماه گذشته', value: shiftsCount.month.toString(), trend: 'up' }
		];
	}

	return (
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

export default BaristaOverview;
