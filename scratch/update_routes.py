import os
import re

files = [
    r"Y:\Naaguru\src\app\api\v1\assessments\active\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\attempts\current\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\attempts\current\answers\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\attempts\current\submit\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\results\current\route.ts"
]

import_statement = "import { withRouteContext } from '@/shared/api/withRouteContext';\n"

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "withRouteContext" not in content:
        # Add import after import { withAuth }
        content = content.replace("import { withAuth } from '@/shared/auth/middleware';", 
                                  "import { withAuth } from '@/shared/auth/middleware';\n" + import_statement)
        
        # Wrap export const GET = withAuth(...) with withRouteContext(withAuth(...))
        content = re.sub(r'export const (\w+) = withAuth\(', r'export const \1 = withRouteContext(\n  withAuth(', content)
        
        # We need to find the end of the withAuth call. It looks like: }, ['STUDENT']);
        content = re.sub(r'\}, \[\'STUDENT\'\]\);', r'}, [\'STUDENT\'])\n);', content)
        
        # Also remove the internal try/catch because withRouteContext handles it!
        # Wait, if we remove internal try/catch, we have to adjust indentation or just leave it?
        # The prompt says withRouteContext catches exceptions. We don't strictly *have* to remove try/catch, 
        # but if the try/catch is swallowing errors and doing NextRespone.json, then withRouteContext won't catch it!
        # Actually, let's just leave the try/catch in the route for now, but the primary bug is that `withAuth`'s 
        # unauthenticated exception bubbles up. Wrapping with `withRouteContext` fixes the `withAuth` exception bubbling.
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated {path}")
