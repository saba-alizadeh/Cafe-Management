import Button from '@mui/material/Button';

export default function SideBarButton({ title }) {
    return <Button style={{ borderRadius: '15px', marginTop: '10px', width: '100%', background: '#667b68' }} variant="contained">{title}</Button>;
}