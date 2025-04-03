import { FaXmark } from "react-icons/fa6";

type Props = {
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
};

const ErrorDialog: React.FC<Props> = ({ errorMessage, setErrorMessage }) => {
  return (
    <div className="w-full bg-red-100 text-red-700 border border-red-300 px-4 py-1.5 rounded-md flex items-center justify-between">
      {errorMessage}
      <FaXmark
        className="cursor-pointer"
        onClick={() => {
          setErrorMessage(null);
        }}
      />
    </div>
  );
};

export default ErrorDialog;
