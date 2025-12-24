import { Box, Paper, Typography, Stack } from '@mui/material';
import { ArrowDropUpRounded, ArrowDropDownRounded, RemoveRounded } from '@mui/icons-material';

const trendStyles = {
	up: { color: 'var(--color-accent)', Icon: ArrowDropUpRounded },
	down: { color: 'var(--color-primary)', Icon: ArrowDropDownRounded },
	neutral: { color: 'var(--color-accent)', Icon: RemoveRounded }
};

const OverviewCard = ({
	title,
	icon,
	metrics,
	background,
	accentColor = 'var(--color-accent)',
	textColor = 'var(--color-primary)',
	onClick
}) => (
	<Paper
		elevation={0}
		onClick={onClick}
		sx={{
			background,
			borderRadius: 4,
			boxShadow: '0 12px 32px rgba(102, 107, 104, 0.12)',
			color: textColor,
			p: { xs: 2.25, sm: 3 },
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			cursor: onClick ? 'pointer' : 'default',
			transition: 'transform 0.2s, box-shadow 0.2s',
			'&:hover': onClick ? {
				transform: 'translateY(-4px)',
				boxShadow: '0 16px 40px rgba(102, 107, 104, 0.18)'
			} : {}
		}}
	>
		<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
			<Typography
				variant="subtitle1"
				sx={{
					fontWeight: 700,
					fontSize: { xs: '1.05rem', sm: '1.175rem' },
					textAlign: 'right',
					flex: 1
				}}
			>
				{title}
			</Typography>
			<Box
				sx={{
					backgroundColor: `${accentColor}1A`,
					borderRadius: '14px',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: accentColor,
					width: 48,
					height: 48
				}}
			>
				{icon}
			</Box>
		</Box>

		<Stack spacing={1.5} mt="auto" direction="column">
			{metrics?.map(({ label, value, trend = 'neutral' }) => {
				const { color, Icon } = trendStyles[trend] ?? trendStyles.neutral;

				return (
					<Box
						key={label}
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						sx={{ direction: 'rtl' }}
					>
						<Typography variant="body2" sx={{ color: 'var(--color-primary)', fontWeight: 500 }}>
							{label}
						</Typography>
						<Box display="flex" alignItems="center" gap={0.5} sx={{ direction: 'ltr' }}>
							<Typography
								variant="subtitle1"
								sx={{ fontWeight: 700, color, lineHeight: 1 }}
							>
								{value}
							</Typography>
							<Icon sx={{ fontSize: 22, color }} />
						</Box>
					</Box>
				);
			})}
		</Stack>
	</Paper>
);

export default OverviewCard;

