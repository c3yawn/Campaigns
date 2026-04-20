import { Grid } from '@mui/material';
import CampaignCard from './CampaignCard';

export default function SystemSection({ system }) {
  return (
    <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
      {system.campaigns.map((campaign, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.id}>
          <CampaignCard campaign={campaign} systemId={system.id} index={i} />
        </Grid>
      ))}
    </Grid>
  );
}
