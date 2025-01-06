import { useState } from "react";

type URLInputFormProps = {
    handleURLScrape: (url: string) => void;
}

const URLInputForm = ({ handleURLScrape }: URLInputFormProps) => {
    const [url, setUrl] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleURLScrape(url);
    };

    return (
        <form className="w-1/4 flex flex-col gap-2" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-0.5">
                <span className="text-xs">URL</span>
                <input className="p-1 text-sm overflow-ellipsis border border-black rounded-sm focus:outline-none" type="text" value={url} onChange={handleChange}/>
            </label>
            <input className=" py-1 px-2 flex self-end cursor-pointer max-w-[80px] border border-black rounded-sm" type="submit" value="Submit" />
        </form>
    )
}

export default URLInputForm;