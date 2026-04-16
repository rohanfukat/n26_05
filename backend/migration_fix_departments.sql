-- Fix mismatched dept_allocated values to match the standard DEPARTMENTS list

UPDATE grievances SET dept_allocated = 'BMC - Water Supply Department' WHERE dept_allocated = 'BMC Water';

UPDATE grievances SET dept_allocated = 'Maharashtra State Electricity Distribution Company (MSEDCL)' WHERE dept_allocated = 'MSEDCL';

UPDATE grievances SET dept_allocated = 'BMC - Roads & Infrastructure (PWD)' WHERE dept_allocated = 'PWD';

UPDATE grievances SET dept_allocated = 'BMC - Solid Waste Management' WHERE dept_allocated = 'Solid Waste';
