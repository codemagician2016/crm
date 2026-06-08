import { Container , Button} from '@mui/material';
import { useRouter } from 'next/router';


const AccessRestricted = () => {
    const router = useRouter();
    return (
        <Container sx={{ marginTop: 17 }}>
            <div className='page-restricted'>
                <h1 className='primary-color'>ACCESS RESTRICTED</h1>
                <div className='mt-2 mb-3'>
                    {`Sorry, You do not have access to this page`}
                </div>
                <Button variant="outlined" className="mainBtn" onClick={() => router.back()}>Go Back</Button>
            </div>
        </Container>
    )
}

export default AccessRestricted;