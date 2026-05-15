export type ExcelCell = string | number | Date | null | undefined;

export interface ExcelSheet {
  name: string;
  columns?: number[];
  rows: ExcelCell[][];
}

const xmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => xmlEscapes[ch]);
}

function cellTypeAndValue(cell: ExcelCell): { type: 'String' | 'Number' | 'DateTime'; value: string } {
  if (cell instanceof Date) {
    return { type: 'DateTime', value: cell.toISOString() };
  }
  if (typeof cell === 'number' && Number.isFinite(cell)) {
    return { type: 'Number', value: String(cell) };
  }
  return { type: 'String', value: String(cell ?? '') };
}

function renderCell(cell: ExcelCell, rowIndex: number): string {
  const isHeader = rowIndex === 0;
  const styleId = isHeader ? 'sHeader' : 'sCell';
  const { type, value } = cellTypeAndValue(cell);
  return `<Cell ss:StyleID="${styleId}"><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function renderWorksheet(sheet: ExcelSheet): string {
  const cols = (sheet.columns ?? []).map((width) => `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`).join('');
  const rows = sheet.rows
    .map((row, rowIndex) => `<Row>${row.map((c) => renderCell(c, rowIndex)).join('')}</Row>`)
    .join('');

  return `<Worksheet ss:Name="${escapeXml(sheet.name)}"><Table>${cols}${rows}</Table></Worksheet>`;
}

export function buildSpreadsheetXml(sheets: ExcelSheet[]): string {
  const styles = `
    <Styles>
      <Style ss:ID="Default" ss:Name="Normal">
        <Alignment ss:Vertical="Center"/>
        <Borders/>
        <Font ss:FontName="Calibri" ss:Size="10"/>
        <Interior/>
        <NumberFormat/>
        <Protection/>
      </Style>
      <Style ss:ID="sHeader">
        <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/>
        <Interior ss:Color="#EAF2FF" ss:Pattern="Solid"/>
        <Borders>
          <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
          <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
          <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
          <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
      </Style>
      <Style ss:ID="sCell">
        <Borders>
          <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
          <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
          <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
          <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
      </Style>
    </Styles>`;

  return `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">${styles}${sheets.map(renderWorksheet).join('')}</Workbook>`;
}
