import os
import re

files = [
    r"Y:\Naaguru\src\app\api\v1\assessments\active\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\attempts\current\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\attempts\current\answers\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\attempts\current\submit\route.ts",
    r"Y:\Naaguru\src\app\api\v1\assessments\results\current\route.ts"
]

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to remove the try { ... } catch (error) { ... } completely.
    # We can use a regex to extract the contents of the try block.
    # The try block always starts with `try {` and ends before `} catch (error) {`.
    
    match = re.search(r'try \{\n(.*?)  \} catch \(error\) \{', content, re.DOTALL)
    if match:
        try_body = match.group(1)
        # Unindent the try body by 4 spaces
        lines = try_body.split('\n')
        unindented_lines = []
        for line in lines:
            if line.startswith('    '):
                unindented_lines.append(line[4:])
            else:
                unindented_lines.append(line)
        new_body = '\n'.join(unindented_lines)
        
        # Now replace the whole try/catch block with the new body
        # The block ends before `}, ['STUDENT'])`
        content = re.sub(r'  try \{.*\} catch \(error\) \{.*return NextResponse\.json\(\{ error: \'Internal Server Error\' \}, \{ status: 500 \}\);\n  \}', new_body, content, flags=re.DOTALL)
        
        # Remove empty lines between the new body and the closing bracket
        content = re.sub(r'\n+', '\n', content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Cleaned {path}")
