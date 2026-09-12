import os

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
        
    content = content.replace("}, [\\'STUDENT\\'])", "}, ['STUDENT'])")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
