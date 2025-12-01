import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ProjectProgress from './ProjectProgress';
import { Project, Report } from '@prisma/client';

type ReportWithProject = Report & { project: Project; };

export default function MainGrid({ report }: { report: ReportWithProject }) {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ProjectProgress currentProgress={report.progress}/>
        </Grid>
      </Grid>
    </Box>
  );
}
