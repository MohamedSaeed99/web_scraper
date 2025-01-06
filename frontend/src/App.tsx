import URLInputForm from './components/URLInputForm'
import { useScrape } from './api/Scrape/useScrape';

function App() {
  const { mutate } = useScrape();

  const handleURLScrape = (url: string) => {
    mutate(url);
  }

  return (
    <div className="w-screen flex justify-center">
      <URLInputForm handleURLScrape={handleURLScrape} />
    </div>
  )
}

export default App
