import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ProjectData {
  name: string;
  description: string;
  originalContractAward: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface ReportData {
  yearCreate: number;
  monthCreate: 'JANUARY' | 'FEBRUARY' | 'MARCH' | 'APRIL' | 'MAY' | 'JUNE' | 
               'JULY' | 'AUGUST' | 'SEPTEMBER' | 'OCTOBER' | 'NOVEMBER' | 'DECEMBER';
  paidUpToNow: number;
  progress: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface IssueData {
  description: string;
  remedy: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'CLOSED';
}

interface EventData {
  name: string;
  description: string;
  plannedStart: string;
  plannedEnd: string;
  completed: boolean;
  actualStart: string | null;
  actualEnd: string | null;
}

interface ImportData {
  project: ProjectData;
  reports: ReportData[];
  issues: IssueData[];
  events: EventData[];
}

async function bulkImport(creatorId: number, dryRun: boolean = true, createNewProject: boolean = false, existingProjectId?: number) {
  try {
    // Read the JSON file
    const dataPath = path.join(process.cwd(), '..', 'target.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const data: ImportData = JSON.parse(jsonData);

    console.log(`👤 Creator ID: ${creatorId}`);
    console.log(`📊 Data Summary:`);
    console.log(`   - Project: ${data.project.name}`);
    console.log(`   - Reports: ${data.reports.length}`);
    console.log(`   - Issues: ${data.issues.length}`);
    console.log(`   - Events: ${data.events.length}`);
    console.log(`🔄 Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE IMPORT'}`);
    console.log('');

    let projectId: number;
    let project: any;

    if (createNewProject) {
      console.log('🆕 Will create new project');
      projectId = -1; // Placeholder for new project
    } else if (existingProjectId) {
      // Verify existing project exists
      project = await prisma.project.findUnique({
        where: { id: existingProjectId }
      });

      if (!project) {
        throw new Error(`Project with ID ${existingProjectId} not found!`);
      }

      console.log(`✅ Existing project found: "${project.name}"`);
      projectId = existingProjectId;
    } else {
      throw new Error('Must specify either --new-project or --project=ID');
    }
    console.log('');

    // Preview Project
    if (createNewProject) {
      console.log('🏢 PROJECT TO CREATE:');
      console.log('====================');
      console.log(`Name: ${data.project.name}`);
      console.log(`Description: ${data.project.description.substring(0, 100)}...`);
      console.log(`Contract Award: $${data.project.originalContractAward.toLocaleString()}`);
      console.log(`Status: ${data.project.status}`);
      console.log('');
    }

    // Preview Reports (show first 5)
    console.log(`📊 REPORTS TO IMPORT (showing first 5 of ${data.reports.length}):`);
    console.log('==============================================================');
    data.reports.slice(0, 5).forEach((report, index) => {
      console.log(`${index + 1}. ${report.monthCreate} ${report.yearCreate}`);
      console.log(`   Paid: $${report.paidUpToNow.toLocaleString()}, Progress: ${(report.progress * 100).toFixed(1)}%`);
      console.log(`   Status: ${report.status}`);
      console.log('');
    });
    if (data.reports.length > 5) {
      console.log(`... and ${data.reports.length - 5} more reports`);
      console.log('');
    }

    // Preview Issues (show first 5)
    console.log(`📝 ISSUES TO IMPORT (showing first 5 of ${data.issues.length}):`);
    console.log('=============================================================');
    data.issues.slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.description.substring(0, 80)}...`);
      console.log(`   Remedy: ${issue.remedy.substring(0, 60)}...`);
      console.log(`   Severity: ${issue.severity}, Likelihood: ${issue.likelihood}, Status: ${issue.status}`);
      console.log('');
    });
    if (data.issues.length > 5) {
      console.log(`... and ${data.issues.length - 5} more issues`);
      console.log('');
    }

    // Preview Events (show first 5)
    console.log(`📅 EVENTS TO IMPORT (showing first 5 of ${data.events.length}):`);
    console.log('=============================================================');
    data.events.slice(0, 5).forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   Description: ${event.description.substring(0, 60)}...`);
      console.log(`   Planned: ${event.plannedStart} → ${event.plannedEnd}`);
      console.log(`   Completed: ${event.completed}`);
      if (event.actualStart) console.log(`   Actual: ${event.actualStart} → ${event.actualEnd || 'ongoing'}`);
      console.log('');
    });
    if (data.events.length > 5) {
      console.log(`... and ${data.events.length - 5} more events`);
      console.log('');
    }

    if (dryRun) {
      console.log('🔍 DRY RUN COMPLETE - No data was imported');
      if (createNewProject) {
        console.log('📝 To create new project and import all data:');
        console.log('   npx tsx bulk-import.ts --live --new-project --creator=3');
      } else {
        console.log('📝 To import into existing project:');
        console.log(`   npx tsx bulk-import.ts --live --project=${projectId} --creator=${creatorId}`);
      }
      return;
    }

    // Actual import
    console.log('🚀 Starting live import...');
    
    let projectCount = 0;
    let reportCount = 0;
    let issueCount = 0;
    let eventCount = 0;

    // Create new project if requested
    if (createNewProject) {
      const newProject = await prisma.project.create({
        data: {
          name: data.project.name,
          description: data.project.description,
          originalContractAward: data.project.originalContractAward,
          status: data.project.status as any,
          creatorId,
        }
      });
      projectId = newProject.id;
      projectCount++;
      console.log(`✅ Project created with ID: ${projectId}`);
    }

    // Import Reports (with duplicate check)
    console.log('🔍 Checking for existing reports...');
    const existingReports = await prisma.report.findMany({
      where: { projectId },
      select: { yearCreate: true, monthCreate: true }
    });
    const existingReportKeys = new Set(existingReports.map(r => `${r.yearCreate}-${r.monthCreate}`));
    
    for (const report of data.reports) {
      const reportKey = `${report.yearCreate}-${report.monthCreate}`;
      if (existingReportKeys.has(reportKey)) {
        console.log(`⏭️  Skipping duplicate report: ${report.monthCreate} ${report.yearCreate}`);
        continue;
      }
      
      await prisma.report.create({
        data: {
          projectId,
          creatorId,
          yearCreate: report.yearCreate,
          monthCreate: report.monthCreate,
          paidUpToNow: report.paidUpToNow,
          progress: report.progress,
          status: report.status as any,
        }
      });
      reportCount++;
      if (reportCount % 5 === 0) {
        console.log(`✅ ${reportCount} reports imported...`);
      }
    }

    // Import Issues (with duplicate check)
    console.log('🔍 Checking for existing issues...');
    const existingIssues = await prisma.issue.findMany({
      where: { projectId },
      select: { description: true }
    });
    const existingDescriptions = new Set(existingIssues.map(i => i.description));
    
    for (const issue of data.issues) {
      if (existingDescriptions.has(issue.description)) {
        console.log(`⏭️  Skipping duplicate issue: ${issue.description.substring(0, 60)}...`);
        continue;
      }
        
      // Generate a title from the first part of the description
      const title = issue.description.length > 50 
        ? issue.description.substring(0, 47) + '...'
        : issue.description;

      await prisma.issue.create({
        data: {
          projectId,
          creatorId,
          title,
          description: issue.description,
          remedy: issue.remedy,
          severity: issue.severity,
          likelihood: issue.likelihood,
          status: issue.status,
        }
      });
      issueCount++;
      if (issueCount % 10 === 0) {
        console.log(`✅ ${issueCount} issues imported...`);
      }
    }

    // Import Events (with duplicate check)
    console.log('🔍 Checking for existing events...');
    const existingEvents = await prisma.event.findMany({
      where: { projectId },
      select: { name: true, plannedStart: true }
    });
    const existingEventKeys = new Set(existingEvents.map(e => `${e.name}-${e.plannedStart.toISOString()}`));
    
    for (const event of data.events) {
      const eventKey = `${event.name}-${event.plannedStart}`;
      if (existingEventKeys.has(eventKey)) {
        console.log(`⏭️  Skipping duplicate event: ${event.name}`);
        continue;
      }
      
      await prisma.event.create({
        data: {
          projectId,
          name: event.name,
          description: event.description,
          plannedStart: new Date(event.plannedStart),
          plannedEnd: new Date(event.plannedEnd),
          completed: event.completed,
          actualStart: event.actualStart ? new Date(event.actualStart) : null,
          actualEnd: event.actualEnd ? new Date(event.actualEnd) : null,
        }
      });
      eventCount++;
      if (eventCount % 10 === 0) {
        console.log(`✅ ${eventCount} events imported...`);
      }
    }

    console.log('');
    console.log('🎉 IMPORT COMPLETE!');
    if (projectCount > 0) console.log(`🏢 Created ${projectCount} project`);
    console.log(`📊 Imported ${reportCount} reports`);
    console.log(`📝 Imported ${issueCount} issues`);
    console.log(`📅 Imported ${eventCount} events`);
    console.log(`🔗 View at: http://localhost:3000/project/${projectId}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isLive = args.includes('--live');
const isNewProject = args.includes('--new-project');
const projectIdArg = args.find(arg => arg.startsWith('--project='));
const creatorIdArg = args.find(arg => arg.startsWith('--creator='));

const projectId = projectIdArg ? parseInt(projectIdArg.split('=')[1]) : undefined;
const creatorId = creatorIdArg ? parseInt(creatorIdArg.split('=')[1]) : 1; // Default creator ID 1

// Validate arguments
if (isNaN(creatorId)) {
  console.error('❌ Invalid creator ID');
  console.log('Usage:');
  console.log('  Create new project: npx tsx bulk-import.ts [--live] --new-project --creator=3');
  console.log('  Use existing project: npx tsx bulk-import.ts [--live] --project=2 --creator=3');
  process.exit(1);
}

if (!isNewProject && (!projectId || isNaN(projectId))) {
  console.error('❌ Must specify either --new-project or --project=ID');
  console.log('Usage:');
  console.log('  Create new project: npx tsx bulk-import.ts [--live] --new-project --creator=3');
  console.log('  Use existing project: npx tsx bulk-import.ts [--live] --project=2 --creator=3');
  process.exit(1);
}

// Run the import
bulkImport(creatorId, !isLive, isNewProject, projectId).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});