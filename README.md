# MH Wilds Talisman Manager

A Next.js web application for managing Monster Hunter Wilds talismans. This tool allows you to create, edit, organize, and export your talisman collection with a user-friendly interface inspired by the [MH Wilds Skill Simulator](https://mhwilds.wiki-db.com/sim/).

## Features

### 🛡️ Talisman Management
- **Add/Edit Talismans**: Create and modify talismans with dropdown suggestions for skills and slot configurations
- **Visual Table View**: Display all your talismans in an organized table with drag-and-drop reordering
- **Skill Validation**: All skills and slot combinations are validated against the official Monster Hunter Wilds data
- **Rarity Tracking**: Support for all talisman rarities (稀有度5-8)

### 📊 Data Import/Export
- **CSV Export**: Export your talisman collection to CSV format for backup or sharing
- **CSV Import**: Import talismans from CSV files
- **Copy/Paste Support**: Easy text-based export for quick sharing
- **File Upload**: Drag-and-drop CSV file import

### 💾 Local Storage
- **Browser Persistence**: Your talisman collection is automatically saved to browser localStorage
- **No Server Required**: Everything runs locally in your browser
- **Data Privacy**: Your talisman data never leaves your device

### 🎨 User Interface
- **Monster Hunter Theme**: Styled with colors and design inspired by Monster Hunter Wilds
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean, organized interface for easy talisman management

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd MHWilds-talisman-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Adding a Talisman
1. Fill out the talisman form with:
   - **Name**: Custom name for your talisman
   - **Rarity**: Select from 稀有度5-8
   - **Skills**: Choose up to 3 skills with levels (0-7)
   - **Decoration Slots**: Select slot configuration
   - **Notes**: Optional additional information

2. Click "Add Talisman" to save

### Managing Talismans
- **Edit**: Click the "Edit" button on any talisman to modify it
- **Delete**: Click "Delete" to remove a talisman (with confirmation)
- **Reorder**: Drag and drop talismans in the table to reorder them

### Import/Export
- **Export**: Click "Generate CSV Text" or "Download CSV File"
- **Import**: Upload a CSV file or paste CSV data in the text area
- **Format**: CSV includes columns for Name, Rarity, Skills, Levels, Slots, and Notes

## Data Source

The application uses the official Monster Hunter Wilds talisman data extracted from the game files, including:
- 124 unique talisman templates
- All available skills and skill combinations
- Complete slot point mappings
- Rarity distributions

## CSV Format

The CSV export/import format includes the following columns:
```
Name,Rarity,Skill1,Skill1Level,Skill2,Skill2Level,Skill3,Skill3Level,SlotDescription,Notes
```

Example:
```csv
"My Attack Talisman","稀有度7","攻击Lv1","3","看破Lv1","2","","0","防具2级孔x1","Great for attack builds"
```

## Technical Details

- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS with custom Monster Hunter theme
- **Storage**: Browser localStorage for data persistence
- **Data Validation**: TypeScript interfaces ensure data integrity
- **Responsive**: Mobile-first design with Tailwind CSS

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This project is open source. Feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the ISC License.

## Acknowledgments

- Inspired by the [MH Wilds Skill Simulator](https://mhwilds.wiki-db.com/sim/)
- Uses official Monster Hunter Wilds game data
- Built with modern web technologies for optimal performance