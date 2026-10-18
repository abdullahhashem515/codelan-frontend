import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiUploadFile, UPLOAD_MAX_BYTES } from '../services/api';
import { fitImage } from '../utils/fitImage';

const TOAST = { style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } };

// Drop-zone image uploader shared by the admin forms (site identity, project
// covers, ...). Posts to the existing /upload endpoint and hands the returned
// URL back through onChange.
//
// With `multiple`, several files can be picked at once; they go up one after
// another (the server allows 20 uploads a minute) and onChange is called once
// per file, so the caller must append with a functional state update.
const ImageUpload = ({ value, onChange, label, hint, previewClass = 'max-h-40', multiple = false }) => {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        if (files.length > 1) setProgress(`${i + 1}/${files.length}`);
        await uploadOne(files[i]);
      }
    } finally {
      setUploading(false);
      setProgress('');
      if (ref.current) ref.current.value = '';
    }
  };

  const uploadOne = async (file) => {
    try {
      // Oversized images are scaled down in the browser rather than refused.
      const ready = await fitImage(file);
      if (ready !== file && file.size > UPLOAD_MAX_BYTES) {
        toast(`صُغّرت الصورة تلقائياً من ${(file.size / 1048576).toFixed(1)}MB إلى ${(ready.size / 1048576).toFixed(1)}MB`, TOAST);
      }
      const form = new FormData();
      form.append('file', ready);
      const res = await apiUploadFile(form);
      onChange(res.data.url);
    } catch (err) {
      // The reason matters here: wrong type, too large, or rate-limited.
      toast.error(`${file.name}: ${err?.message || 'فشل رفع الصورة — حاول مرة أخرى'}`, TOAST);
    }
  };

  return (
    <>
      <div
        onClick={() => !uploading && ref.current.click()}
        className="border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 rounded-2xl p-6
                   flex flex-col items-center gap-3 cursor-pointer transition-colors"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-500">
            <svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-xs">جاري الرفع{progress ? ` ${progress}` : ""}...</span>
          </div>
        ) : value ? (
          <img src={value} alt="preview" className={`${previewClass} rounded-xl object-contain`} />
        ) : (
          <>
            <Upload size={28} className="text-gray-400 dark:text-slate-600" />
            <div className="text-center">
              <p className="text-gray-500 dark:text-slate-400 text-sm">{label}</p>
              {hint && <p className="text-gray-400 dark:text-slate-600 text-xs mt-1">{hint}</p>}
            </div>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/x-icon"
        className="hidden"
        multiple={multiple}
        onChange={e => handleFiles(e.target.files)}
      />
    </>
  );
};

export default ImageUpload;
