import { Grid } from '@mui/material';
import CampaignCard from './CampaignCard';

export default function SystemSection({ system, memberCampaignIds, charactersByCampaign }) {
  return (
    <Grid container spacing={3} sx={{ justifyContent: 'center', alignItems: 'stretch' }}>
      {system.campaigns.map((campaign, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.id}>
          <CampaignCard
            campaign={campaign}
            systemId={system.id}
            index={i}
            isMember={memberCampaignIds?.has(campaign.id) ?? false}
            liveCharacters={charactersByCampaign?.[campaign.id] ?? null}
          />
        </Grid>
      ))}
    </Grid>
  );
}
