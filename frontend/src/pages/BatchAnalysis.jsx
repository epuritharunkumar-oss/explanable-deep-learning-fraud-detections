import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { batchApi } from '../services/api';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  Download, 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  FileText,
  BrainCircuit,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart2,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function BatchAnalysis() {
  const [file, setFile] = useState(null);
  const [datasetRows, setDatasetRows] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Training state
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [trainingMetrics, setTrainingMetrics] = useState(null);

  // Prediction state
  const [predictLoading, setPredictLoading] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState(null);

  // General error & export
  const [errorMessage, setErrorMessage] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Inspect dataset columns
  const TARGET_COL_NAMES = ['is_fraud', 'fraud', 'fraud_flag', 'fraudulent', 'class', 'label', 'target', 'is_fraudulent'];
  const ID_COL_NAMES = ['transaction_id', 'customer_id', 'txn_id', 'cust_id', 'id', 'user_id', 'account_id'];

  const inspectRows = (rows, fileName = 'dataset.csv') => {
    if (!rows || rows.length === 0) {
      setValidationError("Uploaded dataset is empty.");
      setDatasetInfo(null);
      return;
    }

    const allHeaders = Object.keys(rows[0]);
    const detectedTarget = allHeaders.find(h => TARGET_COL_NAMES.includes(h.trim().toLowerCase()));
    const excludedIds = allHeaders.filter(h => ID_COL_NAMES.includes(h.trim().toLowerCase()));
    const potentialFeatures = allHeaders.filter(h => h !== detectedTarget && !excludedIds.includes(h));

    // Distinguish numeric vs categorical
    const sample = rows.slice(0, 50);
    const numFeatures = [];
    const catFeatures = [];

    potentialFeatures.forEach(feat => {
      let isNumeric = true;
      for (const r of sample) {
        const v = r[feat];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          if (isNaN(Number(v))) {
            isNumeric = false;
            break;
          }
        }
      }
      if (isNumeric) numFeatures.push(feat);
      else catFeatures.push(feat);
    });

    const total = rows.length;
    const trainCount = Math.floor(total * 0.8);
    const testCount = total - trainCount;

    if (!detectedTarget) {
      setValidationError("Training cannot start because the dataset does not contain a valid fraud target column.");
      setDatasetInfo({
        fileName,
        total,
        trainCount,
        testCount,
        allHeaders,
        detectedTarget: null,
        excludedIds,
        numFeatures,
        catFeatures,
        featureCount: potentialFeatures.length
      });
      setModelTrained(false);
      return;
    }

    setValidationError(null);
    setDatasetInfo({
      fileName,
      total,
      trainCount,
      testCount,
      allHeaders,
      detectedTarget,
      excludedIds,
      numFeatures,
      catFeatures,
      featureCount: potentialFeatures.length
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setBatchResults(null);
      setModelTrained(false);
      setTrainingMetrics(null);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return;

        const headers = lines[0].split(',').map(h => h.trim());
        const parsedRows = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',');
          if (vals.length >= headers.length) {
            const rowObj = {};
            headers.forEach((h, idx) => {
              rowObj[h] = vals[idx] ? vals[idx].trim() : '';
            });
            parsedRows.push(rowObj);
          }
        }
        setDatasetRows(parsedRows);
        setPreviewRows(parsedRows.slice(0, 10));
        inspectRows(parsedRows, selectedFile.name);
      };
      reader.readAsText(selectedFile);
    }
  };

  const loadDemoDataset = async () => {
    setErrorMessage(null);
    setValidationError(null);
    setBatchResults(null);
    setModelTrained(false);
    setTrainingMetrics(null);
    try {
      const res = await batchApi.getDemoDataset();
      const rows = res.data.sample_rows;
      setDatasetRows(rows);
      setPreviewRows(rows.slice(0, 10));
      setFile(new File([JSON.stringify(rows)], "fraud_dataset.csv", { type: "text/csv" }));
      inspectRows(rows, "fraud_dataset.csv (Multi-Modal Ground Truth)");
    } catch (err) {
      console.error("Demo dataset error:", err);
      setErrorMessage("Failed to load demo dataset from backend.");
    }
  };

  // STEP 2: Train Deep Learning Neural Network
  const handleTrainModel = async () => {
    if (!datasetRows || datasetRows.length === 0) return;
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setTrainingLoading(true);
    setErrorMessage(null);

    try {
      let res;
      if (file && file.size && file.type === "text/csv") {
        const formData = new FormData();
        formData.append('file', file);
        res = await batchApi.trainModel(formData);
      } else {
        res = await batchApi.trainModelJson({
          transactions: datasetRows,
          dataset_name: datasetInfo?.fileName || "Financial Fraud Dataset"
        });
      }

      setTrainingMetrics(res.data);
      setModelTrained(true);
    } catch (err) {
      console.error("Training error:", err);
      setErrorMessage(err.response?.data?.error || "Failed to train Deep Neural Network model. Please check backend connection.");
    } finally {
      setTrainingLoading(false);
    }
  };

  // STEP 3: Generate AI Predictions using Trained Model
  const handleGeneratePredictions = async () => {
    if (!modelTrained) {
      setErrorMessage("Please train the AI model first before generating predictions.");
      return;
    }

    setPredictLoading(true);
    setErrorMessage(null);

    try {
      const res = await batchApi.predictBatchJson({ transactions: datasetRows }, { use_test_only: false });
      setBatchResults(res.data);
    } catch (err) {
      console.error("Prediction error:", err);
      setErrorMessage(err.response?.data?.error || "Failed to execute trained Deep Learning predictions.");
    } finally {
      setPredictLoading(false);
    }
  };

  // STEP 4: Export to Excel (.xlsx) with Sheet 1: AI Predictions, Sheet 2: Model Evaluation
  const handleExportExcel = async () => {
    if (!batchResults || !batchResults.predictions) return;
    setExporting(true);
    try {
      const payload = {
        predictions: batchResults.predictions,
        evaluation: trainingMetrics || {}
      };
      const response = await batchApi.exportResultsExcel(payload);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'FraudShield_AI_Batch_Predictions.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Excel export error:", err);
      setErrorMessage("Failed to generate Excel export file.");
    } finally {
      setExporting(false);
    }
  };

  // Filtered Predictions Table
  const filteredPredictions = batchResults?.predictions?.filter(p => {
    if (filterType === 'FRAUD') return p.ai_predicted_label === 'Fraudulent';
    if (filterType === 'LEGIT') return p.ai_predicted_label === 'Legitimate';
    if (filterType === 'DISCREPANCY') return p.actual_fraud_label !== p.ai_predicted_label && p.actual_fraud_label !== 'Unknown';
    if (filterType === 'HIGH_RISK') return p.risk_score >= 60;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    Batch Fraud Detection & Dataset Analysis
                  </h1>
                  <p className="text-xs text-slate-400">
                    Multi-modal tabular CSV ingestion, real Deep Neural Network training, holdout evaluation, and AI predictions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={loadDemoDataset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue/20 to-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-xs font-bold hover:bg-brand-cyan/10 transition-all cursor-pointer shadow-lg shadow-brand-cyan/10"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Load Demo CSV Dataset (Ground Truth)
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl border border-brand-rose/40 bg-brand-rose/10 text-brand-rose text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Workflow Stepper Navigation */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${datasetRows.length > 0 ? 'bg-brand-blue/15 border-brand-blue/40 text-white' : 'border-slate-800 text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${datasetRows.length > 0 ? 'bg-brand-blue text-white' : 'bg-slate-800 text-slate-400'}`}>1</div>
              <div>
                <div className="font-bold">Upload Dataset</div>
                <div className="text-[10px] text-slate-400">{datasetRows.length > 0 ? `${datasetRows.length} records` : 'Pending CSV'}</div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${modelTrained ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'border-slate-800 text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${modelTrained ? 'bg-emerald-500 text-navy-950 font-black' : 'bg-slate-800 text-slate-400'}`}>2</div>
              <div>
                <div className="font-bold">Train Deep Model</div>
                <div className="text-[10px] text-slate-400">{modelTrained ? 'Trained & Saved' : 'Pending Training'}</div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${batchResults ? 'bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan' : 'border-slate-800 text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${batchResults ? 'bg-brand-cyan text-navy-950 font-black' : 'bg-slate-800 text-slate-400'}`}>3</div>
              <div>
                <div className="font-bold">AI Predictions</div>
                <div className="text-[10px] text-slate-400">{batchResults ? `${batchResults.predictions.length} scored` : 'Pending Inference'}</div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${batchResults ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' : 'border-slate-800 text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${batchResults ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>4</div>
              <div>
                <div className="font-bold">Excel Export</div>
                <div className="text-[10px] text-slate-400">Multi-Sheet .xlsx</div>
              </div>
            </div>
          </div>

          {/* STEP 1: Upload Dropzone */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-dashed border-slate-700 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue mx-auto flex items-center justify-center shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Upload Multi-Modal Financial Dataset (.csv)</p>
              <p className="text-xs text-slate-400 mt-1">
                Accepts multi-modal transaction logs with target label (<span className="text-brand-cyan font-mono">is_fraud</span>, <span className="text-brand-cyan font-mono">fraud</span>, or <span className="text-brand-cyan font-mono">fraud_flag</span>).
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                id="csvUploadInput"
                className="hidden"
              />
              <label
                htmlFor="csvUploadInput"
                className="inline-block px-5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-navy-800 cursor-pointer transition-colors shadow-md"
              >
                {file ? `Selected: ${file.name}` : 'Browse CSV File'}
              </label>

              {datasetRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setDatasetRows([]);
                    setDatasetInfo(null);
                    setBatchResults(null);
                    setModelTrained(false);
                    setTrainingMetrics(null);
                    setValidationError(null);
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Dataset Validation Banner if Target Missing */}
          {validationError && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs font-semibold flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Target Column Missing</div>
                <div className="mt-0.5">{validationError}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Expected one of: <span className="font-mono text-slate-300">is_fraud, fraud, fraud_flag, fraudulent, class, label, target</span>. Excluded ID columns like <span className="font-mono">transaction_id</span> cannot be used as target.
                </div>
              </div>
            </div>
          )}

          {/* Dataset Information & Preview */}
          {datasetInfo && (
            <div className="space-y-4">
              {/* Dataset Metadata Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-white">{datasetInfo.total}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Records</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-brand-blue">{datasetInfo.trainCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Training (80%)</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-indigo-400">{datasetInfo.testCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Testing (20%)</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-brand-cyan">{datasetInfo.featureCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Input Features</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-sm font-black text-emerald-400 font-mono truncate">
                    {datasetInfo.detectedTarget || 'None'}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Target Column</div>
                </div>
              </div>

              {/* Column Schema Categorization */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Target Column:</span>
                  {datasetInfo.detectedTarget ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                      🎯 {datasetInfo.detectedTarget}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[11px] font-bold">
                      Not Found
                    </span>
                  )}

                  <span className="text-slate-600 mx-1">|</span>

                  <span className="text-[11px] font-bold text-slate-400">Excluded IDs:</span>
                  {datasetInfo.excludedIds.map(id => (
                    <span key={id} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px]">
                      🚫 {id}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Numerical Features:</span>
                  {datasetInfo.numFeatures.map(f => (
                    <span key={f} className="px-1.5 py-0.5 rounded bg-brand-blue/10 text-blue-300 font-mono text-[10px] border border-brand-blue/20">
                      # {f}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Categorical Features:</span>
                  {datasetInfo.catFeatures.map(f => (
                    <span key={f} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px] border border-purple-500/20">
                      Aa {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* First 10 Rows Preview */}
              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-xs text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-cyan" />
                    Dataset Preview (First 10 Rows)
                  </h3>
                  <span className="text-[11px] text-slate-400">Showing 10 of {datasetInfo.total} rows</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-navy-950 text-slate-400">
                      <tr>
                        {datasetInfo.allHeaders.map(h => (
                          <th key={h} className={`px-3 py-2 border-b border-slate-800 text-[11px] whitespace-nowrap ${h === datasetInfo.detectedTarget ? 'text-emerald-400 font-bold bg-emerald-950/20' : ''}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {previewRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                          {datasetInfo.allHeaders.map(h => (
                            <td key={h} className={`px-3 py-1.5 whitespace-nowrap ${h === datasetInfo.detectedTarget ? 'bg-emerald-950/10 font-bold text-emerald-300' : ''}`}>
                              {r[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STEP 2: Train Model Action Bar */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-navy-900 via-indigo-950/40 to-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-brand-cyan" />
                    Deep Learning Neural Network Pipeline
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Separates X & y, enforces strict 80/20 train/test split, handles imbalance via class-weighted BCE, and applies Adam optimizer.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTrainModel}
                    disabled={trainingLoading || Boolean(validationError)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white font-bold text-xs shadow-xl shadow-brand-blue/30 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {trainingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Training DeepNet...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Train AI Model</span>
                      </>
                    )}
                  </button>

                  {modelTrained && (
                    <button
                      type="button"
                      onClick={handleGeneratePredictions}
                      disabled={predictLoading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-emerald-500 text-navy-950 font-extrabold text-xs shadow-xl shadow-brand-cyan/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {predictLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin"></div>
                          <span>Scoring...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Generate AI Predictions</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Model Training Success & Real Evaluation Metrics */}
          {modelTrained && trainingMetrics && (
            <div className="glass-panel rounded-2xl border border-emerald-500/30 p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      Model Trained Successfully
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        {trainingMetrics.model_version}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Evaluated on holdout 20% test partition ({trainingMetrics.testing_records} test samples)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Trained at</div>
                  <div className="text-xs text-slate-200 font-mono">{trainingMetrics.trained_at}</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-navy-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-brand-cyan">
                    {(trainingMetrics.metrics.accuracy * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Test Accuracy</div>
                </div>

                <div className="bg-navy-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-brand-emerald">
                    {(trainingMetrics.metrics.precision * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Precision</div>
                </div>

                <div className="bg-navy-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-indigo-400">
                    {(trainingMetrics.metrics.recall * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Recall</div>
                </div>

                <div className="bg-navy-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-purple-400">
                    {(trainingMetrics.metrics.f1_score * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">F1 Score</div>
                </div>

                <div className="bg-navy-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-amber-400">
                    {trainingMetrics.metrics.roc_auc.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">ROC-AUC</div>
                </div>
              </div>

              {/* Confusion Matrix Breakdown */}
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-brand-cyan" />
                    Holdout Test Confusion Matrix
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Actual test samples vs model predictions without synthetic cheating or data leakage
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                    <div className="text-xs font-bold text-emerald-300">
                      {trainingMetrics.confusion_matrix.true_positives}
                    </div>
                    <div className="text-[9px] text-slate-400">True Positives (TP)</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                    <div className="text-xs font-bold text-emerald-300">
                      {trainingMetrics.confusion_matrix.true_negatives}
                    </div>
                    <div className="text-[9px] text-slate-400">True Negatives (TN)</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                    <div className="text-xs font-bold text-rose-300">
                      {trainingMetrics.confusion_matrix.false_positives}
                    </div>
                    <div className="text-[9px] text-slate-400">False Positives (FP)</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                    <div className="text-xs font-bold text-rose-300">
                      {trainingMetrics.confusion_matrix.false_negatives}
                    </div>
                    <div className="text-[9px] text-slate-400">False Negatives (FN)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Predictions Dashboard & Results Table */}
          {batchResults && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Summary Dashboard Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-white">{batchResults.summary.total_transactions}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Total Scored</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-brand-rose">{batchResults.summary.predicted_fraudulent}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">AI Fraudulent</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-brand-emerald">{batchResults.summary.predicted_legitimate}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">AI Legitimate</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-rose-500">{batchResults.summary.critical_risk_count}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Critical Risk</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-amber-400">{batchResults.summary.high_risk_count}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">High Risk</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-yellow-300">{batchResults.summary.medium_risk_count}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Medium Risk</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-xl font-black text-brand-cyan">{batchResults.summary.low_risk_count}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Low Risk</div>
                </div>
              </div>

              {/* Table Container */}
              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                {/* Table Action Bar */}
                <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Model Inference Output: Actual Label vs AI Prediction
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ground truth CSV label is strictly segregated from the AI model's prediction
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFilterType('ALL')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${filterType === 'ALL' ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        All ({batchResults.predictions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType('FRAUD')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${filterType === 'FRAUD' ? 'bg-brand-rose text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Fraud ({batchResults.summary.predicted_fraudulent})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType('DISCREPANCY')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${filterType === 'DISCREPANCY' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Discrepancies
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType('HIGH_RISK')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${filterType === 'HIGH_RISK' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        High/Critical
                      </button>
                    </div>

                    {/* Export to Excel Button */}
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      disabled={exporting}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {exporting ? 'Generating Excel...' : 'Export AI Predictions to Excel (.xlsx)'}
                    </button>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Transaction ID</th>
                        <th className="px-3 py-3">Customer ID</th>
                        <th className="px-3 py-3">Amount</th>
                        <th className="px-3 py-3 text-center bg-slate-900/70 border-x border-slate-800">Actual CSV Label</th>
                        <th className="px-3 py-3 text-center bg-indigo-950/40 border-r border-slate-800">AI Predicted Label</th>
                        <th className="px-3 py-3 text-center">Probability</th>
                        <th className="px-3 py-3 text-center">Risk Score</th>
                        <th className="px-3 py-3 text-center">Risk Level</th>
                        <th className="px-3 py-3">Recommended Action</th>
                        <th className="px-3 py-3 text-center">XAI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPredictions.map((row, idx) => {
                        const isDiscrepant = row.actual_fraud_label !== row.ai_predicted_label && row.actual_fraud_label !== 'Unknown';
                        const isRowExpanded = expandedRow === row.transaction_id;

                        return (
                          <React.Fragment key={row.transaction_id || idx}>
                            <tr className={`hover:bg-slate-900/60 transition-colors ${isDiscrepant ? 'bg-purple-950/15' : ''}`}>
                              <td className="px-4 py-3 font-mono font-bold text-white text-xs">
                                {row.transaction_id}
                              </td>

                              <td className="px-3 py-3 font-mono text-slate-400 text-xs">
                                {row.customer_id}
                              </td>

                              <td className="px-3 py-3 font-mono font-semibold text-white">
                                ₹{Number(row.amount).toLocaleString('en-IN')}
                              </td>

                              {/* ACTUAL CSV LABEL */}
                              <td className="px-3 py-3 text-center bg-slate-900/30 border-x border-slate-800">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                                    row.actual_fraud_label === 'Fraudulent'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : row.actual_fraud_label === 'Legitimate'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {row.actual_fraud_label}
                                </span>
                              </td>

                              {/* AI PREDICTED LABEL (FROM TRAINED MODEL) */}
                              <td className="px-3 py-3 text-center bg-indigo-950/20 border-r border-slate-800">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[10px] shadow-sm ${
                                    row.ai_predicted_label === 'Fraudulent'
                                      ? 'bg-brand-rose text-white shadow-brand-rose/20'
                                      : 'bg-brand-emerald text-navy-950 shadow-brand-emerald/20 font-black'
                                  }`}
                                >
                                  {row.ai_predicted_label}
                                </span>
                              </td>

                              {/* FRAUD PROBABILITY */}
                              <td className="px-3 py-3 font-mono text-center font-bold text-white">
                                {row.fraud_probability}
                              </td>

                              {/* RISK SCORE */}
                              <td className="px-3 py-3 text-center">
                                <div className="inline-flex items-center gap-1 font-mono font-bold text-xs">
                                  <span className={row.risk_score >= 81 ? 'text-rose-400' : row.risk_score >= 61 ? 'text-amber-400' : row.risk_score >= 31 ? 'text-yellow-300' : 'text-emerald-400'}>
                                    {row.risk_score}
                                  </span>
                                  <span className="text-[10px] text-slate-500">/100</span>
                                </div>
                              </td>

                              {/* RISK LEVEL */}
                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                    row.risk_level === 'Critical'
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : row.risk_level === 'High'
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      : row.risk_level === 'Medium'
                                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {row.risk_level}
                                </span>
                              </td>

                              {/* RECOMMENDED ACTION */}
                              <td className="px-3 py-3">
                                <span
                                  className={`text-[11px] font-bold ${
                                    row.risk_level === 'Critical'
                                      ? 'text-rose-400'
                                      : row.risk_level === 'High'
                                      ? 'text-amber-300'
                                      : row.risk_level === 'Medium'
                                      ? 'text-yellow-200'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {row.recommended_action}
                                </span>
                              </td>

                              {/* XAI ACCORDION TOGGLE */}
                              <td className="px-3 py-3 text-center">
                                {row.explanation ? (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRow(isRowExpanded ? null : row.transaction_id)}
                                    className="p-1 rounded-lg bg-navy-900 border border-slate-700 text-brand-cyan hover:bg-navy-800 transition-colors"
                                    title="View Explainable AI Factors"
                                  >
                                    {isRowExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                ) : (
                                  <span className="text-slate-600 text-[10px]">-</span>
                                )}
                              </td>
                            </tr>

                            {/* EXPANDABLE EXPLAINABLE AI ROW */}
                            {isRowExpanded && row.explanation && (
                              <tr className="bg-navy-900/90 border-b border-slate-800 animate-in fade-in duration-150">
                                <td colSpan={10} className="p-4 space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                                    <div className="flex items-center gap-2">
                                      <BrainCircuit className="w-4 h-4 text-brand-cyan" />
                                      <span className="font-bold text-xs text-white">
                                        Explainable AI Attribution for {row.transaction_id}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 italic">
                                      {row.explanation.reason}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    {row.explanation.top_features?.map((f, fIdx) => (
                                      <div key={fIdx} className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-slate-200 text-[11px]">{f.feature}</div>
                                          <div className="text-[10px] text-slate-400 font-mono">Value: {f.raw_value}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className={`font-black font-mono text-[11px] ${f.contribution > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {f.contribution > 0 ? `+${f.contribution}%` : `${f.contribution}%`}
                                          </div>
                                          <div className="text-[9px] text-slate-500">{f.impact}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t border-slate-800 bg-navy-950 flex items-center justify-between text-xs text-slate-400">
                  <span>Showing {filteredPredictions.length} transactions</span>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={exporting}
                    className="flex items-center gap-1.5 text-brand-cyan hover:underline font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> Download complete 2-sheet Excel report (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
