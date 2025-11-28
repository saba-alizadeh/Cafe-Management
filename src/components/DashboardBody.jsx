export default function DashboardBody({ title, path}) {
    return <div style={{ width: "79vw", backgroundColor: "#fceee9", height: "75%", position: "absolute", top: '17vh', borderRadius: '10px', padding: '15px', boxShadow: '1px 2px 15px gray', textAlign: 'right' }} >
        <h1 style={{ fontSize: '24px' }}>{title}</h1>
        <p style={{ fontSize: '16px' }}>{path}</p>
        <hr/>
    </div>;
}
