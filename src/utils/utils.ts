import fs from 'fs';
import path from 'path';

export function readJsonFiles(folderPath: string): { files: any[], fileNames: string[] } {
    const files = fs.readdirSync(folderPath);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');

    const jsonData: any[] = [];
    const fileNames: string[] = [];

    for (const file of jsonFiles) {
        const filePath = path.join(folderPath, file);
        const data = fs.readFileSync(filePath, 'utf-8');
        jsonData.push(JSON.parse(data));
        fileNames.push(file);
    }

    return { files: jsonData, fileNames };
};


export function readFileContent(filePath: string): string {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data;
};

export function writeJsonToFile(jsonData: object, folderPath: string, fileName: string) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
}

export function extractJson(text: string): any | null {
    const jsonRegex = /{.*}/s;
    const match = text.match(jsonRegex);

    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch (error) {
            return null;
        }
    } else {
        return null;
    }
}
